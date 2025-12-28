import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, Wallet } from 'lucide-react';
import { Button } from './ui/button';

export const SuccessModal = ({ isOpen, onClose, orderDetails }) => {
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
          className="relative w-full max-w-lg bg-gradient-to-b from-[#1E1B4B] to-[#0B0E14] border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-3">
            Payment Received!
          </h2>
          <p className="text-gray-300 mb-8">
            Your order has been successfully processed
          </p>

          {/* Order Details */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-purple-400" />
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Tokens Purchased</div>
                  <div className="text-xl font-bold text-white">
                    {orderDetails?.quantity?.toLocaleString() || '0'} ARA
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Distribution Date</div>
                  <div className="text-lg font-semibold text-green-400">
                    Q2 2026
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-300">
              💎 Your <span className="font-bold text-white">{orderDetails?.quantity?.toLocaleString()} ARA tokens</span> will be automatically credited to your wallet:
            </p>
            <code className="block text-xs text-purple-300 font-mono mt-2 break-all">
              {orderDetails?.walletAddress || ''}
            </code>
            <p className="text-xs text-gray-400 mt-3">
              📅 Expected date: <span className="font-semibold">April-June 2026</span>
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            data-testid="success-close-button"
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
          >
            Отлично!
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            Следите за обновлениями в наших соцсетях
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
