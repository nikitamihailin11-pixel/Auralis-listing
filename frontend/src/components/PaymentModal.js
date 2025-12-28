import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, QrCode } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

const PAYMENT_ADDRESS = '0x794057867f5bd5ea24a9c2152bfbe9bd30b01c7041e17619c6b34ef3a3897501';
const QR_CODE_URL = 'https://customer-assets.emergentagent.com/job_auralis-app/artifacts/99urshmo_photo_2025-12-28_22-11-19.jpg';

export const PaymentModal = ({ isOpen, onClose, orderDetails, onConfirmPayment }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes

  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const copyAddress = () => {
    navigator.clipboard.writeText(PAYMENT_ADDRESS);
    setCopied(true);
    toast.success('Адрес скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#1E1B4B] to-[#0B0E14] border border-white/10 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
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
            <h2 className="text-3xl font-bold text-white mb-2">Оплата заказа</h2>
            <p className="text-gray-400">Переведите {orderDetails.totalAmount} USDT на адрес ниже</p>
          </div>

          {/* Timer */}
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4 mb-6 text-center">
            <div className="text-sm text-gray-300 mb-1">Время на оплату</div>
            <div className="text-3xl font-bold text-orange-400">{formatTime(countdown)}</div>
          </div>

          {/* Order Details */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Количество ARA:</span>
                <span className="font-semibold text-white">{orderDetails.quantity.toLocaleString()} ARA</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Цена за токен:</span>
                <span className="font-semibold text-white">${orderDetails.pricePerToken}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="font-bold text-white">К оплате:</span>
                <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ${orderDetails.totalAmount}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setShowQR(false)}
              variant={!showQR ? 'default' : 'outline'}
              className={`flex-1 h-12 ${
                !showQR
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-white/5 border-white/20 text-gray-300'
              }`}
            >
              Адрес кошелька
            </Button>
            <Button
              onClick={() => setShowQR(true)}
              variant={showQR ? 'default' : 'outline'}
              className={`flex-1 h-12 ${
                showQR
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-white/5 border-white/20 text-gray-300'
              }`}
            >
              <QrCode className="w-5 h-5 mr-2" />
              QR-код
            </Button>
          </div>

          {/* Payment Address or QR */}
          {!showQR ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Aptos (APT) Адрес для оплаты:
              </label>
              <div className="bg-black/40 border border-purple-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <code className="text-xs text-purple-300 font-mono break-all flex-1">
                    {PAYMENT_ADDRESS}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ⚠️ Отправляйте только USDT через сеть Aptos на этот адрес
              </p>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <div className="inline-block bg-white p-4 rounded-2xl">
                <img
                  src={QR_CODE_URL}
                  alt="QR Code"
                  className="w-64 h-64 object-contain"
                />
              </div>
              <p className="text-sm text-gray-400 mt-3">
                Отсканируйте QR-код для оплаты
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <span>📝</span>
              Инструкция по оплате:
            </h3>
            <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
              <li>Скопируйте адрес кошелька или отсканируйте QR-код</li>
              <li>Отправьте {orderDetails.totalAmount} USDT через сеть Aptos</li>
              <li>Нажмите "Я оплатил" после завершения транзакции</li>
              <li>Ваши токены будут начислены в Q2 2026</li>
            </ol>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={onConfirmPayment}
            data-testid="confirm-payment-button"
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg"
          >
            ✓ Я оплатил
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">
            После оплаты обработка может занять до 24 часов
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
