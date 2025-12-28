import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Wallet as WalletIcon } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useWallet } from '../context/WalletContext';

const PAYMENT_ADDRESS = '0x794057867f5bd5ea24a9c2152bfbe9bd30b01c7041e17619c6b34ef3a3897501';

export const PaymentModal = ({ isOpen, onClose, orderDetails, onConfirmPayment }) => {
  const [copied, setCopied] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const { selectedWallet } = useWallet();

  const copyAddress = () => {
    navigator.clipboard.writeText(PAYMENT_ADDRESS);
    setCopied(true);
    toast.success('Адрес скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePayment = async () => {
    setIsPaying(true);
    
    try {
      if (selectedWallet === 'aptos' && window.aptos) {
        // Aptos/Petra Wallet payment
        const transaction = {
          type: 'entry_function_payload',
          function: '0x1::coin::transfer',
          type_arguments: ['0x1::aptos_coin::AptosCoin'],
          arguments: [
            PAYMENT_ADDRESS,
            Math.floor(orderDetails.totalAmount * 100000000) // Convert to Octas (APT smallest unit)
          ]
        };
        
        const response = await window.aptos.signAndSubmitTransaction(transaction);
        
        if (response.hash) {
          toast.success(
            <div>
              <div className="font-bold">Транзакция отправлена!</div>
              <div className="text-xs mt-1">Hash: {response.hash.substring(0, 16)}...</div>
            </div>
          );
          onConfirmPayment();
        }
      } else if (selectedWallet === 'metamask' && window.ethereum) {
        // MetaMask payment
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts.length === 0) {
          toast.error('Пожалуйста, подключите MetaMask');
          setIsPaying(false);
          return;
        }

        const transactionParameters = {
          from: accounts[0],
          to: PAYMENT_ADDRESS,
          value: '0x' + Math.floor(orderDetails.totalAmount * 1e18).toString(16), // Convert to Wei
        };

        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });

        if (txHash) {
          toast.success(
            <div>
              <div className="font-bold">Транзакция отправлена!</div>
              <div className="text-xs mt-1">Hash: {txHash.substring(0, 16)}...</div>
            </div>
          );
          onConfirmPayment();
        }
      } else {
        toast.error('Кошелёк не подключен');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Ошибка оплаты: ' + (error.message || 'Неизвестная ошибка'));
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
            <p className="text-gray-400">Подтвердите транзакцию в вашем кошельке</p>
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

          {/* Payment Address (for reference) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Адрес получателя:
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
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-blue-400" />
              Автоматическая оплата
            </h3>
            <p className="text-sm text-gray-300">
              Нажмите кнопку ниже, чтобы открыть ваш кошелёк и подтвердить транзакцию. 
              Платёж будет отправлен автоматически.
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
                Обработка...
              </div>
            ) : (
              '💳 Оплатить сейчас'
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Токены будут автоматически распределены после окончания presale
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
