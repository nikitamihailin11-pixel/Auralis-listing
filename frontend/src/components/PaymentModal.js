import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet as WalletIcon, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useWallet } from '../context/WalletContext';

const PAYMENT_ADDRESS = 'C8G8Wir2RBNW5bwwrtS4wcpapKqw5abNMXdVjQSGsS21';

export const PaymentModal = ({ isOpen, onClose, orderDetails, onConfirmPayment }) => {
  const [isPaying, setIsPaying] = useState(false);
  const { sendPayment, walletType } = useWallet();

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const response = await sendPayment(parseFloat(orderDetails.totalAmount));
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
      const errorMessage = error.message?.includes('rejected') 
        ? 'Transaction rejected by user' 
        : error.message || 'Payment failed';
      toast.error(errorMessage);
    } finally {
      setIsPaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl glass-effect rounded-3xl p-8 shadow-2xl border border-white/10"
        >
          {/* Close button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Confirm Payment</h2>
            <p className="text-gray-400">Pay with {walletType || 'Solana Wallet'}</p>
          </div>

          {/* Order details */}
          <div className="glass-effect rounded-2xl p-6 mb-6 border border-[#d4a853]/20">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ARA Quantity:</span>
                <span className="font-semibold text-white">{orderDetails.quantity?.toLocaleString()} ARA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price per token:</span>
                <span className="font-semibold text-white">${orderDetails.pricePerToken} USDT</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="font-bold text-white">Total to Pay:</span>
                <span className="font-bold text-2xl text-gradient-gold">
                  ${orderDetails.totalAmount} USDT
                </span>
              </div>
            </div>
          </div>

          {/* Payment address info */}
          <div className="glass-effect rounded-xl p-4 mb-6 border border-[#4dd4e8]/20">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-[#4dd4e8]" />
              Payment Details
            </h3>
            <p className="text-sm text-gray-300 mb-2">
              Funds will be sent to the following Solana address:
            </p>
            <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
              <code className="text-xs text-[#4dd4e8] font-mono flex-1 break-all">
                {PAYMENT_ADDRESS}
              </code>
              <a 
                href={`https://solscan.io/account/${PAYMENT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#4dd4e8] transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Pay button */}
          <Button 
            onClick={handlePayment} 
            disabled={isPaying} 
            data-testid="confirm-payment-button"
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#d4a853] to-[#c87840] hover:from-[#e5b964] hover:to-[#d98950] disabled:opacity-50 text-[#0d1117] rounded-xl glow-gold transition-all"
          >
            {isPaying ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0d1117]" />
                Processing...
              </div>
            ) : (
              `Pay $${orderDetails.totalAmount} USDT Now`
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Tokens will be distributed after presale ends (Q2 2026)
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
