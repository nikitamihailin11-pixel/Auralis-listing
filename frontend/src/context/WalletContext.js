import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [metamaskAccount, setMetamaskAccount] = useState(null);
  const [metamaskBalance, setMetamaskBalance] = useState(null);
  const [aptosAccount, setAptosAccount] = useState(null);
  const [aptosBalance, setAptosBalance] = useState(null);
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [isAptosConnected, setIsAptosConnected] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState('metamask');

  const connectMetamask = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask extension');
      window.open('https://metamask.io/', '_blank');
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        setMetamaskAccount(accounts[0]);
        setIsMetamaskConnected(true);
        await fetchMetamaskBalance(accounts[0]);
        localStorage.setItem('metamaskConnected', 'true');
        
        // Save to backend
        try {
          await axios.post(`${API}/wallets/connect`, {
            address: accounts[0],
            blockchain: 'ethereum',
            balance: 0
          });
        } catch (err) {
          console.error('Failed to save wallet to backend:', err);
        }
      }
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
      alert('Failed to connect MetaMask wallet');
    }
  };

  const fetchMetamaskBalance = async (address) => {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      const balanceInEth = parseInt(balance, 16) / 1e18;
      setMetamaskBalance(balanceInEth.toFixed(4));
    } catch (error) {
      console.error('Failed to fetch MetaMask balance:', error);
    }
  };

  const disconnectMetamask = async () => {
    setMetamaskAccount(null);
    setMetamaskBalance(null);
    setIsMetamaskConnected(false);
    localStorage.removeItem('metamaskConnected');
  };

  const connectAptos = async () => {
    if (typeof window === 'undefined' || !window.aptos) {
      alert('Please install Petra Wallet extension');
      window.open('https://petra.app/', '_blank');
      return;
    }

    try {
      // Check if already connected
      const isConnected = await window.aptos.isConnected();
      
      if (!isConnected) {
        // Request connection
        await window.aptos.connect();
      }
      
      // Get account info
      const account = await window.aptos.account();
      
      if (account && account.address) {
        setAptosAccount(account.address);
        setIsAptosConnected(true);
        localStorage.setItem('aptosConnected', 'true');
        
        // Mock balance for now
        setAptosBalance('0.0000');
        
        // Save to backend
        try {
          await axios.post(`${API}/wallets/connect`, {
            address: account.address,
            blockchain: 'aptos',
            balance: 0
          });
        } catch (err) {
          console.error('Failed to save wallet to backend:', err);
        }
      }
    } catch (error) {
      console.error('Failed to connect Petra:', error);
      
      // More specific error handling
      if (error.message && error.message.includes('User rejected')) {
        alert('Connection rejected. Please try again.');
      } else if (error.message && error.message.includes('Not installed')) {
        alert('Petra Wallet is not installed. Please install it first.');
        window.open('https://petra.app/', '_blank');
      } else {
        alert('Failed to connect Petra wallet: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const disconnectAptos = async () => {
    try {
      if (window.aptos) {
        await window.aptos.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect Petra:', error);
    }
    setAptosAccount(null);
    setAptosBalance(null);
    setIsAptosConnected(false);
    localStorage.removeItem('aptosConnected');
  };

  // Auto-reconnect on page load
  useEffect(() => {
    const reconnectWallets = async () => {
      const wasMetamaskConnected = localStorage.getItem('metamaskConnected') === 'true';
      const wasAptosConnected = localStorage.getItem('aptosConnected') === 'true';

      if (wasMetamaskConnected && window.ethereum) {
        await connectMetamask();
      }

      if (wasAptosConnected && window.aptos) {
        await connectAptos();
      }
    };

    reconnectWallets();
  }, []);

  const value = {
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
    disconnectMetamask,
    disconnectAptos,
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
