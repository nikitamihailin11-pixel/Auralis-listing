import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Check, Clock, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useWallet } from '../context/WalletContext';
import { PaymentModal } from './PaymentModal';
import { SuccessModal } from './SuccessModal';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const ARA_PRICE = 0.01;
const PRESALE_END_DATE = new Date('2026-03-31T23:59:59'); // End of Q1 2026
const TOTAL_SUPPLY = 1000000000; // 1 billion
const TOKENS_FOR_SALE = 400000000; // 40% for community

export const TokenSale = () => {
  const {
    metamaskAccount,
    metamaskBalance,
    aptosAccount,
    aptosBalance,
    isMetamaskConnected,
    isAptosConnected,
    selectedWallet,
    setSelectedWallet,
    connectMetamask,
    connectAptos,
  } = useWallet();

  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [stats, setStats] = useState({ total_ara_sold: 0 });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const currentAddress = selectedWallet === 'metamask' ? metamaskAccount : aptosAccount;
  const currentBalance = selectedWallet === 'metamask' ? metamaskBalance : aptosBalance;
  const isConnected = selectedWallet === 'metamask' ? isMetamaskConnected : isAptosConnected;
  const totalCost = quantity ? (parseFloat(quantity) * ARA_PRICE).toFixed(2) : '0.00';
  
  const soldPercentage = (stats.total_ara_sold / TOKENS_FOR_SALE) * 100;

  // Countdown Timer Effect
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = PRESALE_END_DATE - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch Stats Effect
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  const handlePurchase = async () => {
    if (!currentAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsLoading(true);

    try {
      const blockchain = selectedWallet === 'metamask' ? 'polygon' : 'aptos';
      
      const response = await axios.post(`${API}/orders/create`, {
        wallet_address: currentAddress,
        blockchain: blockchain,
        quantity: parseFloat(quantity),
        price_per_token: ARA_PRICE,
      });

      setPendingOrder({
        id: response.data.id,
        quantity: parseFloat(quantity),
        pricePerToken: ARA_PRICE,
        totalAmount: totalCost,
        walletAddress: currentAddress,
      });
      
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.detail || 'Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = () => {
    setShowPaymentModal(false);
    setShowSuccessModal(true);
    setQuantity('');
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setPendingOrder(null);
  };

  const handleQuickAmount = (amount) => {
    setQuantity(amount.toString());
  };

  return (
    <div id="buy" className="relative py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14] to-[#151921]" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Buy ARA Tokens
          </h2>
          <p className="text-xl text-gray-400">Secure your tokens at presale price</p>
          
          {/* Countdown Timer */}
          <div className="mt-8 inline-block">
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center gap-2 justify-center mb-3">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-300 font-semibold">Presale Ends In</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Days', value: timeLeft.days },
                  { label: 'Hours', value: timeLeft.hours },
                  { label: 'Minutes', value: timeLeft.minutes },
                  { label: 'Seconds', value: timeLeft.seconds },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-3 min-w-[70px]">
                      <div className="text-3xl font-bold text-white">{item.value.toString().padStart(2, '0')}</div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-300 font-semibold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Sale Progress
                </span>
                <span className="text-sm font-bold text-green-400">
                  {soldPercentage.toFixed(2)}% Sold
                </span>
              </div>
              <div className="relative h-4 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${soldPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>{stats.total_ara_sold.toLocaleString()} ARA Sold</span>
                <span>{TOKENS_FOR_SALE.toLocaleString()} ARA Total</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-3xl">
            {/* Wallet Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setSelectedWallet('metamask')}
                  data-testid="select-metamask-button"
                  variant={selectedWallet === 'metamask' ? 'default' : 'outline'}
                  className={`h-20 text-base font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedWallet === 'metamask'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >\n                  <Wallet className=\"w-6 h-6\" />\n                  <span>MetaMask</span>\n                  <span className=\"text-xs opacity-80\">Polygon (POL)</span>\n                </Button>\n                <Button\n                  onClick={() => setSelectedWallet('aptos')}\n                  data-testid=\"select-petra-button\"\n                  variant={selectedWallet === 'aptos' ? 'default' : 'outline'}\n                  className={`h-20 text-base font-semibold transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedWallet === 'aptos'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >\n                  <Wallet className=\"w-6 h-6\" />\n                  <span>Petra Wallet</span>\n                  <span className=\"text-xs opacity-80\">Aptos (USDT)</span>\n                </Button>
              </div>
            </div>

            {/* Connect Wallet Button */}
            {!isConnected && (
              <div className="mb-8">
                <Button
                  onClick={selectedWallet === 'metamask' ? connectMetamask : connectAptos}
                  data-testid="connect-wallet-button"
                  className="w-full h-16 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg"
                >\n                  <Wallet className=\"w-6 h-6 mr-2\" />\n                  Connect {selectedWallet === 'metamask' ? 'MetaMask' : 'Petra Wallet'}
                </Button>
              </div>
            )}

            {/* Connected Wallet Info */}
            {isConnected && currentAddress && (
              <div className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Connected Address</p>
                    <p className="text-sm font-mono font-semibold text-green-400">
                      {currentAddress.substring(0, 8)}...{currentAddress.substring(currentAddress.length - 6)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-semibold">Connected</span>
                  </div>
                </div>
              </div>
            )}

            {/* Token Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">ARA Token Quantity</label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity (e.g., 1000)"
                  data-testid="token-quantity-input"
                  className="h-16 text-lg bg-black/20 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                  ARA
                </div>
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mt-3">
                {[1000, 5000, 10000, 50000].map((amount) => (
                  <Button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-purple-500/50 transition-all"
                  >
                    {amount.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price per token:</span>
                <span className="font-semibold text-white">${ARA_PRICE}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Quantity:</span>
                <span className="font-semibold text-white">{quantity || 0} ARA</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="font-bold text-white text-lg">Total Cost:</span>
                <span className="font-bold text-2xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  ${totalCost}
                </span>
              </div>
            </div>

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={isLoading || !isConnected || !quantity || parseFloat(quantity) <= 0}
              data-testid="create-order-button"
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.4)] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <>
                  <ArrowRight className="w-6 h-6 mr-2" />
                  Create Purchase Order
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Tokens will be automatically distributed after presale ends
            </p>
          </Card>
        </motion.div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderDetails={pendingOrder || {}}
          onConfirmPayment={handleConfirmPayment}
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccess}
          orderDetails={pendingOrder || {}}
        />
      </div>
    </div>
  );
};
