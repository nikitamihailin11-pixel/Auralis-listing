import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useWallet } from '../context/WalletContext';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const ARA_PRICE = 0.01;

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

  const currentAddress = selectedWallet === 'metamask' ? metamaskAccount : aptosAccount;
  const currentBalance = selectedWallet === 'metamask' ? metamaskBalance : aptosBalance;
  const isConnected = selectedWallet === 'metamask' ? isMetamaskConnected : isAptosConnected;
  const totalCost = quantity ? (parseFloat(quantity) * ARA_PRICE).toFixed(2) : '0.00';

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
      const response = await axios.post(`${API}/orders/create`, {
        wallet_address: currentAddress,
        blockchain: selectedWallet === 'metamask' ? 'ethereum' : 'aptos',
        quantity: parseFloat(quantity),
        price_per_token: ARA_PRICE,
      });

      toast.success(
        <div>
          <div className="font-bold">Order Created Successfully!</div>
          <div className="text-sm mt-1">Order ID: {response.data.id.substring(0, 8)}...</div>
          <div className="text-sm">Tokens will be distributed manually</div>
        </div>
      );
      setQuantity('');
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.detail || 'Failed to create order. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
              <label className="block text-sm font-medium text-gray-300 mb-3">Select Wallet</label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setSelectedWallet('metamask')}
                  data-testid="select-metamask-button"
                  variant={selectedWallet === 'metamask' ? 'default' : 'outline'}
                  className={`h-16 text-lg font-semibold transition-all ${
                    selectedWallet === 'metamask'
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white border-0'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjYuNyA2LjZMMTcuOCAxM2wxLjctNC4yIDcuMi0yLjJ6IiBmaWxsPSIjRTI3NjFCIi8+PHBhdGggZD0iTTUuMyA2LjZsOC44IDYuNS0xLjctNC4yLTcuMS0yLjN6bTE3LjggMTQuOGwtMi40IDMuN3Y0LjNsMy42LTItMS4yLTYuMXpNOSAxMC40bDEuNyA0LjJMMy4zIDI5IDkgMjEuNHoiIGZpbGw9IiNFNDc2MUIiLz48L3N2Zz4="
                    alt="MetaMask"
                    className="w-6 h-6 mr-2"
                  />
                  MetaMask
                </Button>
                <Button
                  onClick={() => setSelectedWallet('aptos')}
                  data-testid="select-petra-button"
                  variant={selectedWallet === 'aptos' ? 'default' : 'outline'}
                  className={`h-16 text-lg font-semibold transition-all ${
                    selectedWallet === 'aptos'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Wallet className="w-6 h-6 mr-2" />
                  Petra (Aptos)
                </Button>
              </div>
            </div>

            {/* Connect Wallet Button */}
            {!isConnected && (
              <div className="mb-8">
                <Button
                  onClick={selectedWallet === 'metamask' ? connectMetamask : connectAptos}
                  data-testid="connect-wallet-button"
                  className="w-full h-16 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg"
                >
                  <Wallet className="w-6 h-6 mr-2" />
                  Connect {selectedWallet === 'metamask' ? 'MetaMask' : 'Petra'}
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
              Tokens will be manually distributed to your wallet after payment confirmation
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
