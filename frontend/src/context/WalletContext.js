import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const SOLANA_PAYMENT_ADDRESS = 'C8G8Wir2RBNW5bwwrtS4wcpapKqw5abNMXdVjQSGsS21';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [phantomAccount, setPhantomAccount] = useState(null);
  const [phantomBalance, setPhantomBalance] = useState(null);
  const [isPhantomConnected, setIsPhantomConnected] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState({ totalTokens: 0, totalSpent: 0 });

  const connectPhantom = async () => {
    if (typeof window === 'undefined' || !window.solana) {
      alert('Please install Phantom Wallet');
      window.open('https://phantom.app/', '_blank');
      return;
    }

    try {
      const resp = await window.solana.connect();
      const pubKey = resp.publicKey.toString();
      
      setPhantomAccount(pubKey);
      setIsPhantomConnected(true);
      localStorage.setItem('phantomConnected', 'true');

      // Get balance
      const balance = await window.solana.getBalance();
      setPhantomBalance((balance / 1e9).toFixed(4));

      // Save to backend
      try {
        await axios.post(`${API}/wallets/connect`, {
          address: pubKey,
          blockchain: 'solana',
          balance: 0
        });
      } catch (err) {
        console.error('Failed to save wallet:', err);
      }

      // Fetch user orders
      await fetchUserOrders(pubKey);
    } catch (error) {
      console.error('Phantom connection failed:', error);
      alert('Failed to connect Phantom wallet');
    }
  };

  const fetchUserOrders = async (address) => {
    try {
      const response = await axios.get(`${API}/orders/wallet/${address}`);
      setUserOrders(response.data);
      
      const totalTokens = response.data.reduce((sum, order) => sum + order.quantity, 0);
      const totalSpent = response.data.reduce((sum, order) => sum + order.total_amount, 0);
      
      setUserStats({ totalTokens, totalSpent });
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    }
  };

  const disconnectPhantom = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
    setPhantomAccount(null);
    setPhantomBalance(null);
    setIsPhantomConnected(false);
    setUserOrders([]);
    setUserStats({ totalTokens: 0, totalSpent: 0 });
    localStorage.removeItem('phantomConnected');
  };

  const sendSolanaPayment = async (amountUSD) => {
    if (!window.solana || !isPhantomConnected) {
      throw new Error('Phantom not connected');
    }

    try {
      const { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } = window.solanaWeb3 || {};
      
      if (!SystemProgram) {
        throw new Error('Solana Web3.js not loaded');
      }

      const lamports = Math.floor(amountUSD * LAMPORTS_PER_SOL); // 1 SOL = 1 USD for simplicity
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(phantomAccount),
          toPubkey: new PublicKey(SOLANA_PAYMENT_ADDRESS),
          lamports: lamports,
        })
      );

      transaction.feePayer = new PublicKey(phantomAccount);
      const { blockhash } = await window.solana.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signed = await window.solana.signAndSendTransaction(transaction);
      return { hash: signed.signature };
    } catch (error) {
      console.error('Solana payment failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    const reconnect = async () => {
      if (localStorage.getItem('phantomConnected') === 'true' && window.solana) {
        await connectPhantom();
      }
    };
    reconnect();
  }, []);

  const value = {
    phantomAccount,
    phantomBalance,
    isPhantomConnected,
    userOrders,
    userStats,
    connectPhantom,
    disconnectPhantom,
    sendSolanaPayment,
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
