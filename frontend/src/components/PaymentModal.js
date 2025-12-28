import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet as WalletIcon } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useWallet } from '../context/WalletContext';

export const PaymentModal = ({ isOpen, onClose, orderDetails, onConfirmPayment }) => {
  const [isPaying, setIsPaying] = useState(false);
  const { sendSolanaPayment } = useWallet();

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const response = await sendSolanaPayment(orderDetails.totalAmount);
      if (response && response.hash) {
        toast.success(<div><div className="font-bold">Transaction Sent!</div><div className="text-xs mt-1">Hash: {response.hash.substring(0, 16)}...</div></div>);
        onConfirmPayment();
      }
    } catch (error) {
      toast.error(error.message?.includes('rejected') ? 'Transaction rejected' : error.message || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl glass-effect rounded-3xl p-8 shadow-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-400" />
          </button>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Confirm Payment</h2>
            <p className="text-gray-400">Pay with SOL</p>
          </div>
          <div className="glass-effect rounded-2xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ARA Quantity:</span>
                <span className="font-semibold text-white">{orderDetails.quantity?.toLocaleString()} ARA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price per token:</span>
                <span className="font-semibold text-white">${orderDetails.pricePerToken}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="font-bold text-white">Total to Pay:</span>
                <span className="font-bold text-2xl bg-gradient-to-r from-[#9D7FFF] to-[#4DD4E8] bg-clip-text text-transparent">
                  ${orderDetails.totalAmount} SOL
                </span>
              </div>
            </div>
          </div>
          <div className="glass-effect rounded-xl p-4 mb-6">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-[#4DD4E8]" />Automatic Payment
            </h3>
            <p className="text-sm text-gray-300">
              Click below to open Phantom and confirm the SOL transaction.
            </p>
          </div>
          <Button onClick={handlePayment} disabled={isPaying} data-testid="confirm-payment-button"
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#9D7FFF] to-[#B34DFF] hover:from-[#8B6FE6] hover:to-[#9D3FE6] disabled:opacity-50 text-white rounded-xl">
            {isPaying ? <div className="flex items-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />Processing...</div> : `💳 Pay ${orderDetails.totalAmount} SOL Now`}
          </Button>
          <p className="text-xs text-center text-gray-500 mt-4">Tokens distributed after presale ends</p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
