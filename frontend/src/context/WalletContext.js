import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Payment address for ETH network
const ETH_PAYMENT_ADDRESS = '0x0825d5461abffd07860f28b1b78448cc7ac00239';

// USDT Contract on Ethereum Mainnet
const ETH_USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState({ totalTokens: 0, totalSpent: 0 });

  const getMetaMask = () => window.ethereum?.isMetaMask ? window.ethereum : null;

  const fetchUserOrders = useCallback(async (address) => {
    try {
      const response = await axios.get(`${API}/orders/wallet/${address}`);
      setUserOrders(response.data);
      // Only count confirmed orders for user stats
      const confirmedOrders = response.data.filter(order => order.status === 'confirmed');
      const totalTokens = confirmedOrders.reduce((sum, order) => sum + order.quantity, 0);
      const totalSpent = confirmedOrders.reduce((sum, order) => sum + order.total_amount, 0);
      setUserStats({ totalTokens, totalSpent });
    } catch (error) {
      console.error('Failed to fetch user orders:', error);
    }
  }, []);

  const saveWalletToBackend = useCallback(async (address, blockchain) => {
    try {
      await axios.post(`${API}/wallets/connect`, { address, blockchain, balance: 0 });
    } catch (error) {
      console.error('Failed to save wallet:', error);
    }
  }, []);

  // Connect MetaMask
  const connectMetaMask = async () => {
    const metamask = getMetaMask();
    if (!metamask) {
      window.open('https://metamask.io/', '_blank');
      return;
    }
    try {
      // Request Ethereum Mainnet (chainId 1)
      try {
        await metamask.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }],
        });
      } catch (switchError) {
        console.log('Network switch error:', switchError);
      }
      
      const accounts = await metamask.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWalletAddress(address);
      setWalletType('MetaMask');
      setIsConnected(true);
      localStorage.setItem('walletConnected', 'metamask');
      localStorage.setItem('walletAddress', address);
      await saveWalletToBackend(address, 'ethereum');
      await fetchUserOrders(address);
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
    }
  };

  // Disconnect
  const disconnect = async () => {
    setWalletAddress(null);
    setWalletType(null);
    setIsConnected(false);
    setUserOrders([]);
    setUserStats({ totalTokens: 0, totalSpent: 0 });
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  };

  // Send USDT via MetaMask (Ethereum) with auto-approval
  const sendMetaMaskPayment = async (amountUSDT) => {
    const metamask = getMetaMask();
    if (!metamask) throw new Error('MetaMask not connected');

    // Check network is Ethereum Mainnet
    const chainId = await metamask.request({ method: 'eth_chainId' });
    if (chainId !== '0x1') {
      // Try to switch to Ethereum Mainnet
      try {
        await metamask.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1' }],
        });
      } catch (switchError) {
        throw new Error('Please switch to Ethereum Mainnet');
      }
    }

    // USDT has 6 decimals
    const amount = BigInt(Math.floor(amountUSDT * 1000000));
    const amountHex = amount.toString(16).padStart(64, '0');
    const toAddressHex = ETH_PAYMENT_ADDRESS.toLowerCase().replace('0x', '').padStart(64, '0');
    
    // ERC20 transfer(address,uint256) function
    const data = '0xa9059cbb' + toAddressHex + amountHex;

    const txHash = await metamask.request({
      method: 'eth_sendTransaction',
      params: [{
        from: walletAddress,
        to: ETH_USDT_CONTRACT,
        data: data,
        gas: '0x15F90',
      }],
    });

    return { hash: txHash };
  };

  // Universal payment (MetaMask only)
  const sendPayment = async (amountUSDT) => {
    if (walletType === 'MetaMask') {
      return await sendMetaMaskPayment(amountUSDT);
    }
    throw new Error('No wallet connected');
  };

  // Auto-reconnect
  useEffect(() => {
    const reconnect = async () => {
      const savedWallet = localStorage.getItem('walletConnected');
      const savedAddress = localStorage.getItem('walletAddress');
      
      if (savedWallet === 'metamask' && savedAddress) {
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
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
          }
        }
      }
    };
    setTimeout(reconnect, 500);
  }, [fetchUserOrders]);

  return (
    <WalletContext.Provider value={{
      isConnected, walletAddress, walletType, userOrders, userStats,
      connectMetaMask, disconnect, sendPayment, fetchUserOrders,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
}
