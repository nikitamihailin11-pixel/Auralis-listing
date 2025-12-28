import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const SOLANA_PAYMENT_ADDRESS = 'C8G8Wir2RBNW5bwwrtS4wcpapKqw5abNMXdVjQSGsS21';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [solBalance, setSolBalance] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState({ totalTokens: 0, totalSpent: 0 });

  // Check if Phantom is available
  const getPhantom = () => {
    if (typeof window !== 'undefined' && window.solana?.isPhantom) {
      return window.solana;
    }
    return null;
  };

  // Check if Solflare (MetaMask Snap for Solana) is available
  const getSolflare = () => {
    if (typeof window !== 'undefined' && window.solflare?.isSolflare) {
      return window.solflare;
    }
    return null;
  };

  // Fetch user orders from backend
  const fetchUserOrders = useCallback(async (address) => {
    try {
      const response = await axios.get(`${API}/orders/wallet/${address}`);
      setUserOrders(response.data);
      const totalTokens = response.data.reduce((sum, order) => sum + order.quantity, 0);
      const totalSpent = response.data.reduce((sum, order) => sum + order.total_amount, 0);
      setUserStats({ totalTokens, totalSpent });
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    }
  }, []);

  // Save wallet to backend
  const saveWalletToBackend = useCallback(async (address) => {
    try {
      await axios.post(`${API}/wallets/connect`, {
        address: address,
        blockchain: 'solana',
        balance: 0
      });
    } catch (error) {
      console.error('Failed to save wallet to backend:', error);
    }
  }, []);

  // Connect Phantom wallet
  const connectPhantom = async () => {
    const phantom = getPhantom();
    if (!phantom) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    try {
      const response = await phantom.connect();
      const address = response.publicKey.toString();
      
      setWalletAddress(address);
      setWalletType('Phantom');
      setIsConnected(true);
      localStorage.setItem('walletConnected', 'phantom');
      localStorage.setItem('walletAddress', address);
      
      await saveWalletToBackend(address);
      await fetchUserOrders(address);
    } catch (error) {
      console.error('Failed to connect Phantom:', error);
    }
  };

  // Connect Solflare wallet
  const connectSolflare = async () => {
    const solflare = getSolflare();
    if (!solflare) {
      window.open('https://solflare.com/', '_blank');
      return;
    }

    try {
      await solflare.connect();
      const address = solflare.publicKey.toString();
      
      setWalletAddress(address);
      setWalletType('Solflare');
      setIsConnected(true);
      localStorage.setItem('walletConnected', 'solflare');
      localStorage.setItem('walletAddress', address);
      
      await saveWalletToBackend(address);
      await fetchUserOrders(address);
    } catch (error) {
      console.error('Failed to connect Solflare:', error);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    const phantom = getPhantom();
    const solflare = getSolflare();
    
    try {
      if (walletType === 'Phantom' && phantom) {
        await phantom.disconnect();
      } else if (walletType === 'Solflare' && solflare) {
        await solflare.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }

    setWalletAddress(null);
    setWalletType(null);
    setIsConnected(false);
    setSolBalance(null);
    setUserOrders([]);
    setUserStats({ totalTokens: 0, totalSpent: 0 });
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  };

  // Send payment (simulated for presale - actual payment handled by user externally)
  const sendPayment = async (amountUSD) => {
    // For presale, we record the order and user manually sends USDT
    // This is a placeholder for the actual transaction
    return { hash: `order_${Date.now()}` };
  };

  // Auto-reconnect on page load
  useEffect(() => {
    const reconnect = async () => {
      const savedWallet = localStorage.getItem('walletConnected');
      const savedAddress = localStorage.getItem('walletAddress');
      
      if (savedWallet && savedAddress) {
        if (savedWallet === 'phantom') {
          const phantom = getPhantom();
          if (phantom?.isConnected) {
            setWalletAddress(savedAddress);
            setWalletType('Phantom');
            setIsConnected(true);
            await fetchUserOrders(savedAddress);
          }
        } else if (savedWallet === 'solflare') {
          const solflare = getSolflare();
          if (solflare?.isConnected) {
            setWalletAddress(savedAddress);
            setWalletType('Solflare');
            setIsConnected(true);
            await fetchUserOrders(savedAddress);
          }
        }
      }
    };
    
    // Small delay to ensure wallet extensions are loaded
    setTimeout(reconnect, 500);
  }, [fetchUserOrders]);

  const value = {
    // Connection state
    isConnected,
    walletAddress,
    walletType,
    solBalance,
    
    // User data
    userOrders,
    userStats,
    
    // Actions
    connectPhantom,
    connectSolflare,
    disconnect,
    sendPayment,
    fetchUserOrders,
    
    // Payment address
    paymentAddress: SOLANA_PAYMENT_ADDRESS,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
