import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Check, Clock, TrendingUp, Award, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useWallet } from '../context/WalletContext';
import { SuccessModal } from './SuccessModal';
import { TransactionStatusModal } from './TransactionStatusModal';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const ARA_PRICE = 0.01;

// Set presale end date to 127 days from now
const PRESALE_END_DATE = new Date();
PRESALE_END_DATE.setDate(PRESALE_END_DATE.getDate() + 127);

export const TokenSale = () => {
  const { isConnected, walletAddress, walletType, userStats, connectMetaMask, sendPayment, fetchUserOrders } = useWallet();
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [stats, setStats] = useState({ total_ara_sold: 0, tokens_for_sale: 400000000 });
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Transaction status state
  const [showTxModal, setShowTxModal] = useState(false);
  const [txStep, setTxStep] = useState('creating');
  const [txError, setTxError] = useState('');
  const [currentTxHash, setCurrentTxHash] = useState('');

  const totalCost = quantity ? (parseFloat(quantity) * ARA_PRICE).toFixed(2) : '0.00';
  const tokensForSale = stats.tokens_for_sale || 400000000;
  const soldPercentage = Math.min((stats.total_ara_sold / tokensForSale) * 100, 100);

  // Countdown timer
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

  // Fetch stats
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
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const usdtAmount = parseFloat(totalCost);
    
    setIsLoading(true);
    setShowTxModal(true);
    setTxStep('creating');
    setTxError('');
    setCurrentTxHash('');
    
    let orderId = null;
    
    try {
      // Step 1: Create order (awaiting_payment status)
      setTxStep('creating');
      const orderResponse = await axios.post(`${API}/orders/create`, {
        wallet_address: walletAddress,
        blockchain: 'ethereum',
        quantity: parseFloat(quantity),
        price_per_token: ARA_PRICE,
      });
      orderId = orderResponse.data.id;

      // Step 2: Send USDT payment via MetaMask
      setTxStep('waiting_wallet');
      
      const paymentResult = await sendPayment(usdtAmount);
      
      if (paymentResult && paymentResult.hash) {
        setCurrentTxHash(paymentResult.hash);
        setTxStep('sending');
        
        // Step 3: Submit transaction hash for verification
        await axios.put(`${API}/orders/${orderId}/submit-payment`, {
          tx_hash: paymentResult.hash
        });

        // Step 4: Verify payment on blockchain
        setTxStep('verifying');
        
        try {
          const verifyResponse = await axios.post(`${API}/orders/${orderId}/verify-payment`);
          
          if (verifyResponse.data.verified) {
            // Payment verified successfully
            setTxStep('success');
            
            await fetchUserOrders(walletAddress);
            const statsResponse = await axios.get(`${API}/stats`);
            setStats(statsResponse.data);

            setCompletedOrder({
              id: orderId,
              quantity: parseFloat(quantity),
              pricePerToken: ARA_PRICE,
              totalAmount: totalCost,
              walletAddress: walletAddress,
              txHash: paymentResult.hash,
            });
            
            setQuantity('');
            
            // Close tx modal after 3 seconds and show success modal
            setTimeout(() => {
              setShowTxModal(false);
              setShowSuccessModal(true);
            }, 3000);
          } else {
            // Payment sent but not yet verified - this is NORMAL, needs admin review
            // DO NOT mark as failed - money was sent!
            setTxStep('pending_review');
            
            await fetchUserOrders(walletAddress);
            setQuantity('');
            
            // Close modal after 5 seconds
            setTimeout(() => {
              setShowTxModal(false);
            }, 5000);
          }
        } catch (verifyError) {
          // Verification request failed - but payment was sent!
          // Keep status as payment_sent for admin review
          console.error('Verification error:', verifyError);
          setTxStep('pending_review');
          
          await fetchUserOrders(walletAddress);
          setQuantity('');
          
          setTimeout(() => {
            setShowTxModal(false);
          }, 5000);
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      
      // Only show error and mark as failed if transaction was NOT sent
      if (error.message?.includes('User rejected') || error.code === 4001) {
        setTxStep('error');
        setTxError('Transaction was cancelled by user.');
        
        // Mark order as failed only if user cancelled
        if (orderId) {
          try {
            await axios.put(`${API}/orders/${orderId}/status`, { status: 'failed' });
          } catch (e) {}
        }
      } else if (error.message?.includes('insufficient')) {
        setTxStep('error');
        setTxError('Insufficient USDT balance in your wallet.');
        
        if (orderId) {
          try {
            await axios.put(`${API}/orders/${orderId}/status`, { status: 'failed' });
          } catch (e) {}
        }
      } else if (currentTxHash) {
        // Transaction was sent but something went wrong after
        // DO NOT mark as failed - money might have been sent!
        setTxStep('pending_review');
      } else {
        setTxStep('error');
        setTxError(error.message || 'Transaction failed. Please try again.');
        
        if (orderId) {
          try {
            await axios.put(`${API}/orders/${orderId}/status`, { status: 'failed' });
          } catch (e) {}
        }
      }
      
      // Close modal after 5 seconds
      setTimeout(() => {
        setShowTxModal(false);
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setCompletedOrder(null);
  };

  const handleQuickAmount = (amount) => setQuantity(amount.toString());

  return (
    <div id="buy" className="relative py-20 md:py-32 aurora-bg">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4a853] rounded-full blur-[200px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4dd4e8] rounded-full blur-[200px] opacity-10" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Globe className="w-10 h-10 text-[#4dd4e8]" />
            Buy ARA Tokens
          </h2>
          <p className="text-xl text-gray-400">Join the global community at presale price</p>

          {/* Countdown */}
          <div className="mt-8 inline-block glass-effect rounded-2xl p-6 border border-[#d4a853]/20">
            <div className="flex items-center gap-2 justify-center mb-3">
              <Clock className="w-5 h-5 text-[#d4a853]" />
              <span className="text-sm text-gray-300 font-semibold">Presale Ends In</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[{ label: 'Days', value: timeLeft.days }, { label: 'Hours', value: timeLeft.hours },
                { label: 'Minutes', value: timeLeft.minutes }, { label: 'Seconds', value: timeLeft.seconds }].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="bg-gradient-to-br from-[#d4a853] to-[#c87840] rounded-xl p-3 min-w-[70px]">
                    <div className="text-3xl font-bold text-[#0d1117]">{item.value.toString().padStart(2, '0')}</div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-8 max-w-2xl mx-auto glass-effect rounded-2xl p-6 border border-[#4dd4e8]/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-300 font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4dd4e8]" />Sale Progress
              </span>
              <span className="text-sm font-bold text-[#4dd4e8]">{soldPercentage.toFixed(2)}% Sold</span>
            </div>
            <div className="relative h-4 bg-black/40 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${soldPercentage}%` }} 
                transition={{ duration: 1 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#d4a853] to-[#4dd4e8] rounded-full" 
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{stats.total_ara_sold.toLocaleString()} ARA</span>
              <span>{tokensForSale.toLocaleString()} ARA</span>
            </div>
          </div>
        </motion.div>

        {/* Main card */}
        <Card className="glass-effect p-8 rounded-3xl border border-white/10">
          {!isConnected ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#d4a853]/20 to-[#4dd4e8]/20 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-[#d4a853]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-gray-400 mb-6">Connect MetaMask wallet to purchase ARA tokens with USDT on Ethereum</p>
              <Button 
                onClick={connectMetaMask}
                className="h-14 px-8 font-bold bg-gradient-to-r from-[#F6851B] to-[#E2761B] hover:from-[#FFa03d] hover:to-[#F6851B] text-white rounded-xl transition-all hover:scale-105"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect MetaMask
              </Button>
            </div>
          ) : (
            <div>
              {/* Connected wallet info */}
              <div className="glass-effect rounded-2xl p-6 mb-6 border border-[#d4a853]/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Connected Wallet ({walletType})</p>
                    <p className="text-sm font-mono font-semibold text-[#4dd4e8]">
                      {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <Award className="w-6 h-6 mx-auto mb-2 text-[#d4a853]" />
                    <div className="text-2xl font-bold text-white">{userStats.totalTokens.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">ARA Purchased</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[#4dd4e8]" />
                    <div className="text-2xl font-bold text-white">{userStats.totalTokens.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">To Receive (Q2 2026)</div>
                  </div>
                </div>
              </div>

              {/* Quantity input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">ARA Token Quantity</label>
                <Input 
                  type="number" 
                  min="0" 
                  step="100" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity" 
                  data-testid="token-quantity-input"
                  className="h-16 text-lg bg-black/20 border border-white/10 rounded-xl px-4 text-white placeholder:text-gray-500" 
                />
                <div className="flex gap-2 mt-3">
                  {[1000, 5000, 10000, 50000].map((amount) => (
                    <Button 
                      key={amount} 
                      onClick={() => handleQuickAmount(amount)} 
                      variant="outline" 
                      size="sm"
                      className="flex-1 bg-white/5 border-white/10 text-gray-300 hover:bg-[#d4a853]/20 hover:border-[#d4a853]/50 hover:text-[#d4a853]"
                    >
                      {amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Order summary */}
              <div className="glass-effect rounded-xl p-6 mb-6 border border-[#4dd4e8]/20">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Price per token:</span>
                  <span className="font-semibold text-white">${ARA_PRICE} USDT</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="font-semibold text-white">{quantity || 0} ARA</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-bold text-white">Total:</span>
                  <span className="font-bold text-2xl text-gradient-gold">${totalCost} USDT</span>
                </div>
              </div>

              {/* Purchase button */}
              <Button 
                onClick={handlePurchase} 
                disabled={isLoading || !quantity || parseFloat(quantity) <= 0} 
                data-testid="create-order-button"
                className="w-full h-16 text-lg font-bold bg-gradient-to-r from-[#d4a853] to-[#c87840] hover:from-[#e5b964] hover:to-[#d98950] disabled:opacity-50 text-[#0d1117] rounded-xl glow-gold transition-all hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0d1117]" />
                    Confirming...
                  </div>
                ) : (
                  <><ArrowRight className="w-6 h-6 mr-2" />Buy {quantity || 0} ARA for ${totalCost}</>
                )}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-4">Payment via Ethereum (USDT) • Tokens distributed Q2 2026</p>
            </div>
          )}
        </Card>

        <TransactionStatusModal
          isOpen={showTxModal}
          currentStep={txStep}
          errorMessage={txError}
          txHash={currentTxHash}
        />

        <SuccessModal 
          isOpen={showSuccessModal} 
          onClose={handleCloseSuccess} 
          orderDetails={completedOrder || {}} 
        />
      </div>
    </div>
  );
};
