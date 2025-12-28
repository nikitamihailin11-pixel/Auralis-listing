import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Payment addresses
const SOLANA_PAYMENT_ADDRESS = 'C8G8Wir2RBNW5bwwrtS4wcpapKqw5abNMXdVjQSGsS21';
const ETH_PAYMENT_ADDRESS = '0x0825d5461abffd07860f28b1b78448cc7ac00239';

// USDT Contract on Ethereum Mainnet
const ETH_USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState({ totalTokens: 0, totalSpent: 0 });

  const getPhantom = () => window.solana?.isPhantom ? window.solana : null;
  const getMetaMask = () => window.ethereum?.isMetaMask ? window.ethereum : null;

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

  const saveWalletToBackend = useCallback(async (address, blockchain) => {
    try {
      await axios.post(`${API}/wallets/connect`, { address, blockchain, balance: 0 });
    } catch (error) {
      console.error('Failed to save wallet:', error);
    }
  }, []);

  // Connect Phantom
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
      await saveWalletToBackend(address, 'solana');
      await fetchUserOrders(address);
    } catch (error) {
      console.error('Failed to connect Phantom:', error);
    }
  };

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
    const phantom = getPhantom();
    if (walletType === 'Phantom' && phantom) {
      try { await phantom.disconnect(); } catch (e) {}
    }
    setWalletAddress(null);
    setWalletType(null);
    setIsConnected(false);
    setUserOrders([]);
    setUserStats({ totalTokens: 0, totalSpent: 0 });
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  };

  // Send SOL via Phantom
  const sendPhantomPayment = async (amountUSDT) => {
    const phantom = getPhantom();
    if (!phantom?.publicKey) throw new Error('Phantom not connected');

    const connection = new Connection(SOLANA_RPC, 'confirmed');
    const fromPubkey = phantom.publicKey;
    const toPubkey = new PublicKey(SOLANA_PAYMENT_ADDRESS);
    
    // Convert USDT to SOL (approx rate: 1 SOL ≈ $200)
    const solAmount = Math.max(amountUSDT / 200, 0.001);
    const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports,
      })
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const { signature } = await phantom.signAndSendTransaction(transaction);
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, 'confirmed');

    return { hash: signature };
  };

  // Send USDT via MetaMask (Ethereum)
  const sendMetaMaskPayment = async (amountUSDT) => {
    const metamask = getMetaMask();
    if (!metamask) throw new Error('MetaMask not connected');

    // Check network is Ethereum Mainnet
    const chainId = await metamask.request({ method: 'eth_chainId' });
    if (chainId !== '0x1') {
      throw new Error('Please switch to Ethereum Mainnet');
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

  // Universal payment
  const sendPayment = async (amountUSDT) => {
    if (walletType === 'Phantom') {
      return await sendPhantomPayment(amountUSDT);
    } else if (walletType === 'MetaMask') {
      return await sendMetaMaskPayment(amountUSDT);
    }
    throw new Error('No wallet connected');
  };

  // Auto-reconnect
  useEffect(() => {
    const reconnect = async () => {
      const savedWallet = localStorage.getItem('walletConnected');
      const savedAddress = localStorage.getItem('walletAddress');
      
      if (savedWallet === 'phantom' && savedAddress) {
        const phantom = getPhantom();
        if (phantom) {
          try {
            const response = await phantom.connect({ onlyIfTrusted: true });
            if (response.publicKey) {
              setWalletAddress(response.publicKey.toString());
              setWalletType('Phantom');
              setIsConnected(true);
              await fetchUserOrders(response.publicKey.toString());
            }
          } catch (e) {
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
          }
        }
      } else if (savedWallet === 'metamask' && savedAddress) {
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
      connectPhantom, connectMetaMask, disconnect, sendPayment, fetchUserOrders,
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
