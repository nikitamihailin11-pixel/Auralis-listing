import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Check, Clock, TrendingUp, Award } from 'lucide-react';
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
const PRESALE_END_DATE = new Date('2026-03-31T23:59:59');
const TOTAL_SUPPLY = 1000000000;
const TOKENS_FOR_SALE = 400000000;

export const TokenSale = () => {
  const { phantomAccount, isPhantomConnected, connectPhantom, userStats } = useWallet();
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [stats, setStats] = useState({ total_ara_sold: 0 });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const totalCost = quantity ? (parseFloat(quantity) * ARA_PRICE).toFixed(2) : '0.00';
  const soldPercentage = (stats.total_ara_sold / TOKENS_FOR_SALE) * 100;

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
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

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
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handlePurchase = async () => {
    if (!phantomAccount) {
      toast.error('Please connect Phantom wallet');
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter valid quantity');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/orders/create`, {
        wallet_address: phantomAccount,
        blockchain: 'solana',
        quantity: parseFloat(quantity),
        price_per_token: ARA_PRICE,
      });
      setPendingOrder({
        id: response.data.id,
        quantity: parseFloat(quantity),
        pricePerToken: ARA_PRICE,
        totalAmount: totalCost,
        walletAddress: phantomAccount,
      });
      setShowPaymentModal(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create order');
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

  const handleQuickAmount = (amount) => setQuantity(amount.toString());

  return (
    <div id="buy" className="relative py-20 md:py-32 aurora-bg">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Buy ARA Tokens</h2>
          <p className="text-xl text-gray-400">Secure tokens at presale price</p>
          <div className="mt-8 inline-block glass-effect rounded-2xl p-6">
            <div className="flex items-center gap-2 justify-center mb-3">
              <Clock className="w-5 h-5 text-[#4DD4E8]" />
              <span className="text-sm text-gray-300 font-semibold">Presale Ends In</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[{ label: 'Days', value: timeLeft.days }, { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes }, { label: 'Seconds', value: timeLeft.seconds }].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="bg-gradient-to-br from-[#9D7FFF] to-[#B34DFF] rounded-xl p-3 min-w-[70px]">
                    <div className="text-3xl font-bold text-white">{item.value.toString().padStart(2, '0')}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 max-w-2xl mx-auto glass-effect rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300 font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4DD4E8]" />Sale Progress
              </span>
              <span className="text-sm font-bold text-[#4DD4E8]">{soldPercentage.toFixed(2)}% Sold</span>
            </div>
            <div className="relative h-4 bg-black/40 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${soldPercentage}%` }} transition={{ duration: 1 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#9D7FFF] to-[#4DD4E8] rounded-full" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{stats.total_ara_sold.toLocaleString()} ARA</span>
              <span>{TOKENS_FOR_SALE.toLocaleString()} ARA</span>
            </div>
          </div>
        </motion.div>

        <Card className="glass-effect p-8 rounded-3xl">
          {!isPhantomConnected ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-[#9D7FFF]" />
              <h3 className="text-2xl font-bold text-white mb-2">Connect Phantom Wallet</h3>
              <p className="text-gray-400 mb-6">Connect to view your stats and purchase tokens</p>
              <Button onClick={connectPhantom} data-testid="connect-wallet-button"
                className="bg-gradient-to-r from-[#9D7FFF] to-[#B34DFF] hover:from-[#8B6FE6] hover:to-[#9D3FE6] text-white font-bold py-6 px-10 rounded-2xl">
                <Wallet className="w-6 h-6 mr-2" />Connect Phantom
              </Button>
            </div>
          ) : (
            <div>
              <div className="glass-effect rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Connected Wallet</p>
                    <p className="text-sm font-mono font-semibold text-[#4DD4E8]">
                      {phantomAccount.substring(0, 8)}...{phantomAccount.substring(phantomAccount.length - 6)}
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-[#4DD4E8]" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <Award className="w-6 h-6 mx-auto mb-2 text-[#9D7FFF]" />
                    <div className="text-2xl font-bold text-white">{userStats.totalTokens.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">ARA Purchased</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[#4DD4E8]" />
                    <div className="text-2xl font-bold text-white">{userStats.totalTokens.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">To Receive (Q2 2026)</div>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">ARA Token Quantity</label>
                <Input type="number" min="0" step="100" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity" data-testid="token-quantity-input"
                  className="h-16 text-lg bg-black/20 border border-white/10 rounded-xl px-4 text-white" />
                <div className="flex gap-2 mt-3">
                  {[1000, 5000, 10000, 50000].map((amount) => (
                    <Button key={amount} onClick={() => handleQuickAmount(amount)} variant="outline" size="sm"
                      className="flex-1 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10">{amount.toLocaleString()}</Button>
                  ))}
                </div>
              </div>
              <div className="glass-effect rounded-xl p-6 mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Price per token:</span>
                  <span className="font-semibold text-white">${ARA_PRICE}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="font-semibold text-white">{quantity || 0} ARA</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-bold text-white">Total:</span>
                  <span className="font-bold text-2xl bg-gradient-to-r from-[#9D7FFF] to-[#4DD4E8] bg-clip-text text-transparent">${totalCost}</span>
                </div>
              </div>
              <Button onClick={handlePurchase} disabled={isLoading || !quantity || parseFloat(quantity) <= 0} data-testid="create-order-button"
                className="w-full h-16 text-lg font-bold bg-gradient-to-r from-[#9D7FFF] to-[#B34DFF] hover:from-[#8B6FE6] hover:to-[#9D3FE6] disabled:opacity-50 text-white rounded-xl glow-violet">
                {isLoading ? 'Processing...' : <><ArrowRight className="w-6 h-6 mr-2" />Purchase Tokens</>}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-4">Tokens distributed after presale ends</p>
            </div>
          )}
        </Card>

        <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)}
          orderDetails={pendingOrder || {}} onConfirmPayment={handleConfirmPayment} />
        <SuccessModal isOpen={showSuccessModal} onClose={handleCloseSuccess} orderDetails={pendingOrder || {}} />
      </div>
    </div>
  );
};
