import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const PAYMENT_ADDRESS = '0x794057867f5bd5ea24a9c2152bfbe9bd30b01c7041e17619c6b34ef3a3897501';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [aptosAccount, setAptosAccount] = useState(null);
  const [aptosBalance, setAptosBalance] = useState(null);
  const [isAptosConnected, setIsAptosConnected] = useState(false);

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

  const sendUSDTPayment = async (amountUSD) => {
    if (!window.aptos || !isAptosConnected) {
      throw new Error('Petra Wallet not connected');
    }

    try {
      // USDT on Aptos - using LayerZero USDT
      const USDT_TYPE = '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT';
      
      // Convert USD to USDT (assuming 1:1, USDT has 6 decimals)
      const usdtAmount = Math.floor(amountUSD * 1000000);
      
      const transaction = {
        type: 'entry_function_payload',
        function: '0x1::coin::transfer',
        type_arguments: [USDT_TYPE],
        arguments: [
          PAYMENT_ADDRESS,
          usdtAmount.toString()
        ]
      };
      
      const response = await window.aptos.signAndSubmitTransaction(transaction);
      return response;
    } catch (error) {
      console.error('USDT payment failed:', error);
      throw error;
    }
  };

  // Auto-reconnect on page load
  useEffect(() => {
    const reconnectWallets = async () => {
      const wasAptosConnected = localStorage.getItem('aptosConnected') === 'true';

      if (wasAptosConnected && window.aptos) {
        await connectAptos();
      }
    };

    reconnectWallets();
  }, []);

  const value = {
    aptosAccount,
    aptosBalance,
    isAptosConnected,
    connectAptos,
    disconnectAptos,
    sendUSDTPayment,
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
