import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet as WalletIcon } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useWallet } from '../context/WalletContext';

export const PaymentModal = ({ isOpen, onClose, orderDetails, onConfirmPayment }) => {
  const [isPaying, setIsPaying] = useState(false);
  const { selectedWallet, sendPolygonUSDT, sendUSDTPayment } = useWallet();

  const handlePayment = async () => {
    setIsPaying(true);
    
    try {
      let response;
      
      if (selectedWallet === 'metamask') {
        response = await sendPolygonUSDT(orderDetails.totalAmount);
      } else {
        response = await sendUSDTPayment(orderDetails.totalAmount);
      }
      
      if (response && response.hash) {
        toast.success(
          <div>
            <div className="font-bold">Transaction Sent!</div>
            <div className="text-xs mt-1">Hash: {response.hash.substring(0, 16)}...</div>
          </div>
        );
        onConfirmPayment();
      }
    } catch (error) {
      console.error('Payment failed:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction was rejected';
        } else if (error.message.includes('Insufficient')) {
          errorMessage = 'Insufficient USDT balance';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsPaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#1E1B4B] to-[#0B0E14] border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Confirm Payment</h2>
            <p className="text-gray-400">Pay with {paymentCurrency} on {paymentNetwork}</p>
          </div>

          {/* Order Details */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ARA Quantity:</span>
                <span className="font-semibold text-white">{orderDetails.quantity?.toLocaleString()} ARA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price per token:</span>
                <span className="font-semibold text-white">${orderDetails.pricePerToken}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Network:</span>
                <span className="font-semibold text-white">{paymentNetwork}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="font-bold text-white">Total to Pay:</span>
                <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ${orderDetails.totalAmount} {paymentCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-blue-400" />
              Automatic Payment
            </h3>
            <p className="text-sm text-gray-300">
              Click the button below to open your {selectedWallet === 'metamask' ? 'MetaMask' : 'Petra'} wallet and confirm the transaction. 
              Payment will be sent automatically to the secure address.
            </p>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isPaying}
            data-testid="confirm-payment-button"
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl shadow-lg"
          >
            {isPaying ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                Processing...
              </div>
            ) : (
              `💳 Pay ${orderDetails.totalAmount} ${paymentCurrency} Now`
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Tokens will be automatically distributed after presale ends
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
