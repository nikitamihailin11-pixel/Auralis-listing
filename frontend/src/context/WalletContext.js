import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Payment addresses
const APTOS_PAYMENT_ADDRESS = '0x794057867f5bd5ea24a9c2152bfbe9bd30b01c7041e17619c6b34ef3a3897501';
const POLYGON_PAYMENT_ADDRESS = '0x0825d5461abffd07860f28b1b78448cc7ac00239';

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
            blockchain: 'polygon',
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
      const isConnected = await window.aptos.isConnected();
      
      if (!isConnected) {
        await window.aptos.connect();
      }
      
      const account = await window.aptos.account();
      
      if (account && account.address) {
        setAptosAccount(account.address);
        setIsAptosConnected(true);
        localStorage.setItem('aptosConnected', 'true');
        setAptosBalance('0.0000');
        
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

  const sendPolygonUSDT = async (amountUSD) => {
    if (!window.ethereum || !isMetamaskConnected) {
      throw new Error('MetaMask not connected');
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length === 0) {
        throw new Error('Please connect MetaMask');
      }

      // Switch to Polygon network (Chain ID: 137)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x89' }], // 137 in hex
        });
      } catch (switchError) {
        // Chain not added, add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/']
            }]
          });
        } else {
          throw switchError;
        }
      }

      // Send transaction (assuming payment in MATIC)
      const transactionParameters = {
        from: accounts[0],
        to: POLYGON_PAYMENT_ADDRESS,
        value: '0x' + Math.floor(amountUSD * 1e18).toString(16),
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      return { hash: txHash };
    } catch (error) {
      console.error('Polygon payment failed:', error);
      throw error;
    }
  };

  const sendUSDTPayment = async (amountUSD) => {
    if (!window.aptos || !isAptosConnected) {
      throw new Error('Petra Wallet not connected');
    }

    try {
      const USDT_TYPE = '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT';
      const usdtAmount = Math.floor(amountUSD * 1000000);
      
      const transaction = {
        type: 'entry_function_payload',
        function: '0x1::coin::transfer',
        type_arguments: [USDT_TYPE],
        arguments: [
          APTOS_PAYMENT_ADDRESS,
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
    sendPolygonPayment,
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
