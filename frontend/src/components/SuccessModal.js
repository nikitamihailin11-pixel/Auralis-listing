import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Calendar, Wallet, Sparkles } from 'lucide-react';
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
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#162234] to-[#0d1117] border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#d4a853] to-[#c87840] mb-6 glow-gold"
          >
            <CheckCircle className="w-12 h-12 text-[#0d1117]" />
          </motion.div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-3">
            Purchase Successful!
          </h2>
          <p className="text-gray-300 mb-8">
            Your ARA tokens have been reserved
          </p>

          {/* Order Details */}
          <div className="glass-effect border border-white/10 rounded-2xl p-6 mb-6 text-left">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d4a853]/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#d4a853]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Tokens Purchased</div>
                  <div className="text-xl font-bold text-white">
                    {orderDetails?.quantity?.toLocaleString() || '0'} ARA
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d4a853]/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#d4a853]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Amount Paid</div>
                  <div className="text-xl font-bold text-gradient-gold">
                    ${orderDetails?.totalAmount || '0'} USDT
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4dd4e8]/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#4dd4e8]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400">Distribution Date</div>
                  <div className="text-lg font-semibold text-[#4dd4e8]">
                    Q2 2026
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-[#d4a853]/10 to-[#4dd4e8]/10 border border-[#d4a853]/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-300">
              Your <span className="font-bold text-white">{orderDetails?.quantity?.toLocaleString()} ARA tokens</span> will be automatically airdropped to your connected wallet after the presale ends.
            </p>
            <p className="text-xs text-gray-400 mt-3">
              Expected date: <span className="font-semibold text-white">April-June 2026</span>
            </p>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            data-testid="success-close-button"
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#d4a853] to-[#c87840] hover:from-[#e5b964] hover:to-[#d98950] text-[#0d1117] rounded-xl glow-gold"
          >
            Excellent!
          </Button>

          <p className="text-xs text-gray-500 mt-4">
            Follow updates on our social media
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
