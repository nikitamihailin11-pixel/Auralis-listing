import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState({ totalTokens: 0, totalSpent: 0 });

  // Check if Phantom is available
  const getPhantom = () => {
    if (typeof window !== 'undefined' && window.solana?.isPhantom) {
      return window.solana;
    }
    return null;
  };

  // Check if MetaMask is available
  const getMetaMask = () => {
    if (typeof window !== 'undefined' && window.ethereum?.isMetaMask) {
      return window.ethereum;
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

  // Connect MetaMask wallet
  const connectMetaMask = async () => {
    const metamask = getMetaMask();
    if (!metamask) {
      window.open('https://metamask.io/', '_blank');
      return;
    }

    try {
      const accounts = await metamask.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      setWalletAddress(address);
      setWalletType('MetaMask');
      setIsConnected(true);
      localStorage.setItem('walletConnected', 'metamask');
      localStorage.setItem('walletAddress', address);
      
      await saveWalletToBackend(address);
      await fetchUserOrders(address);
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    const phantom = getPhantom();
    
    try {
      if (walletType === 'Phantom' && phantom) {
        await phantom.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }

    setWalletAddress(null);
    setWalletType(null);
    setIsConnected(false);
    setUserOrders([]);
    setUserStats({ totalTokens: 0, totalSpent: 0 });
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
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
        } else if (savedWallet === 'metamask') {
          const metamask = getMetaMask();
          if (metamask) {
            try {
              const accounts = await metamask.request({ method: 'eth_accounts' });
              if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setWalletType('MetaMask');
                setIsConnected(true);
                await fetchUserOrders(accounts[0]);
              }
            } catch (e) {
              console.error('MetaMask reconnect error:', e);
            }
          }
        }
      }
    };
    
    setTimeout(reconnect, 500);
  }, [fetchUserOrders]);

  const value = {
    isConnected,
    walletAddress,
    walletType,
    userOrders,
    userStats,
    connectPhantom,
    connectMetaMask,
    disconnect,
    fetchUserOrders,
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
