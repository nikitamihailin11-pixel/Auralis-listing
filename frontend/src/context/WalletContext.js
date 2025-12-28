import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Payment receiving address (Solana)
const SOLANA_PAYMENT_ADDRESS = 'C8G8Wir2RBNW5bwwrtS4wcpapKqw5abNMXdVjQSGsS21';
// Solana RPC
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

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

  // Disconnect wallet
  const disconnect = async () => {
    const phantom = getPhantom();
    
    try {
      if (phantom) {
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

  // Send SOL payment via Phantom
  const sendPayment = async (amountUSDT) => {
    const phantom = getPhantom();
    if (!phantom || !phantom.publicKey) {
      throw new Error('Phantom wallet not connected');
    }

    try {
      const connection = new Connection(SOLANA_RPC, 'confirmed');
      const fromPubkey = phantom.publicKey;
      const toPubkey = new PublicKey(SOLANA_PAYMENT_ADDRESS);
      
      // For presale: convert USDT amount to SOL equivalent
      // Using approximate rate: 1 SOL ≈ $200, so $1 USDT ≈ 0.005 SOL
      // Minimum 0.001 SOL for small amounts
      const solAmount = Math.max(amountUSDT * 0.005, 0.001);
      const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      // Create simple SOL transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromPubkey,
          toPubkey: toPubkey,
          lamports: lamports,
        })
      );

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      // Sign and send transaction via Phantom
      const { signature } = await phantom.signAndSendTransaction(transaction);
      
      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      return { hash: signature };
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  };

  // Auto-reconnect on page load
  useEffect(() => {
    const reconnect = async () => {
      const savedWallet = localStorage.getItem('walletConnected');
      const savedAddress = localStorage.getItem('walletAddress');
      
      if (savedWallet === 'phantom' && savedAddress) {
        const phantom = getPhantom();
        if (phantom) {
          try {
            // Try to reconnect silently
            const response = await phantom.connect({ onlyIfTrusted: true });
            if (response.publicKey) {
              setWalletAddress(response.publicKey.toString());
              setWalletType('Phantom');
              setIsConnected(true);
              await fetchUserOrders(response.publicKey.toString());
            }
          } catch (e) {
            // Silent reconnect failed, clear saved state
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
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
    disconnect,
    sendPayment,
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
