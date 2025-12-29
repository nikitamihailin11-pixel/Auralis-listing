import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Send, Search, Clock, AlertCircle } from 'lucide-react';

const STEPS = [
  { id: 'creating', label: 'Creating order...', icon: Clock },
  { id: 'waiting_wallet', label: 'Confirm in MetaMask...', icon: Send },
  { id: 'sending', label: 'Sending transaction...', icon: Loader2 },
  { id: 'verifying', label: 'Verifying on blockchain...', icon: Search },
];

export const TransactionStatusModal = ({ isOpen, currentStep, errorMessage, txHash }) => {
  if (!isOpen) return null;

  const getCurrentStepIndex = () => {
    return STEPS.findIndex(s => s.id === currentStep);
  };

  const isError = currentStep === 'error';
  const isSuccess = currentStep === 'success';
  const isConfirming = currentStep === 'confirming';
  const currentIndex = getCurrentStepIndex();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md glass-effect rounded-3xl p-8 shadow-2xl border border-white/10"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isError ? 'bg-red-500/20 border-2 border-red-500' :
              isSuccess ? 'bg-green-500/20 border-2 border-green-500' :
              isConfirming ? 'bg-blue-500/20 border-2 border-blue-500' :
              'bg-[#d4a853]/20 border-2 border-[#d4a853]'
            }`}>
              {isError ? (
                <XCircle className="w-10 h-10 text-red-500" />
              ) : isSuccess ? (
                <CheckCircle className="w-10 h-10 text-green-500" />
              ) : isConfirming ? (
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              ) : (
                <Loader2 className="w-10 h-10 text-[#d4a853] animate-spin" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white">
              {isError ? 'Transaction Failed' : 
               isSuccess ? 'Tokens Received!' : 
               isConfirming ? 'Confirming...' :
               'Processing Transaction'}
            </h2>
          </div>

          {/* Steps - only show for processing */}
          {!isError && !isSuccess && !isConfirming && (
            <div className="space-y-3 mb-6">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive ? 'bg-[#d4a853]/20 border border-[#d4a853]/50' :
                      isCompleted ? 'bg-green-500/10 border border-green-500/30' :
                      'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-[#d4a853] text-black' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-white/10 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : isActive ? (
                        <StepIcon className={`w-4 h-4 ${step.id === 'sending' || step.id === 'verifying' ? 'animate-spin' : ''}`} />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-[#d4a853]' :
                      isCompleted ? 'text-green-400' :
                      'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Error Message */}
          {isError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-4"
            >
              <p className="text-red-400 text-sm text-center font-semibold">
                {errorMessage || 'Transaction failed'}
              </p>
              <p className="text-gray-500 text-xs text-center mt-2">No tokens will be issued.</p>
              {txHash && (
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-[#4dd4e8] hover:underline mt-3"
                >
                  View failed transaction →
                </a>
              )}
            </motion.div>
          )}

          {/* Confirming Message */}
          {isConfirming && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4"
            >
              <p className="text-blue-400 text-sm text-center font-semibold">
                Transaction sent!
              </p>
              <p className="text-gray-400 text-xs text-center mt-2">
                Waiting for blockchain confirmation. Check your orders for status updates.
              </p>
              {txHash && (
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-[#4dd4e8] hover:underline mt-3"
                >
                  Track on Etherscan →
                </a>
              )}
            </motion.div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4"
            >
              <p className="text-green-400 text-sm text-center font-semibold">
                🎉 Payment confirmed! Your ARA tokens have been reserved!
              </p>
              <p className="text-gray-400 text-xs text-center mt-2">
                Tokens will be distributed after the presale ends (Q2 2026).
              </p>
              {txHash && (
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-[#4dd4e8] hover:underline mt-2"
                >
                  View on Etherscan →
                </a>
              )}
            </motion.div>
          )}

          {/* Progress indicator */}
          {!isError && !isSuccess && !isConfirming && (
            <div className="mt-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#d4a853] to-[#4dd4e8]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentIndex + 1) / 4) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Please do not close this window
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
