import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Solana USDT SPL Token Mint Address
const USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
// Payment receiving address (Solana)
const SOLANA_PAYMENT_ADDRESS = 'C8G8Wir2RBNW5bwwrtS4wcpapKqw5abNMXdVjQSGsS21';

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

  // Send USDT payment via Phantom (Solana SPL Token)
  const sendPhantomPayment = async (amountUSDT) => {
    const phantom = getPhantom();
    if (!phantom || !phantom.isConnected) {
      throw new Error('Phantom wallet not connected');
    }

    try {
      // USDT on Solana has 6 decimals
      const usdtAmount = Math.floor(amountUSDT * 1000000);
      
      // Create SPL Token transfer instruction
      // We need to use Phantom's signAndSendTransaction for SPL tokens
      const { Connection, PublicKey, Transaction, TransactionInstruction } = await import('@solana/web3.js');
      
      const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
      const fromPubkey = phantom.publicKey;
      const toPubkey = new PublicKey(SOLANA_PAYMENT_ADDRESS);
      const mintPubkey = new PublicKey(USDT_MINT);
      
      // Get associated token accounts
      const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
      const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
      
      // Derive associated token account addresses
      const fromATA = PublicKey.findProgramAddressSync(
        [fromPubkey.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mintPubkey.toBytes()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];
      
      const toATA = PublicKey.findProgramAddressSync(
        [toPubkey.toBytes(), TOKEN_PROGRAM_ID.toBytes(), mintPubkey.toBytes()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0];

      // Create transfer instruction
      const transferInstruction = new TransactionInstruction({
        keys: [
          { pubkey: fromATA, isSigner: false, isWritable: true },
          { pubkey: toATA, isSigner: false, isWritable: true },
          { pubkey: fromPubkey, isSigner: true, isWritable: false },
        ],
        programId: TOKEN_PROGRAM_ID,
        data: Buffer.from([
          3, // Transfer instruction
          ...new Uint8Array(new BigUint64Array([BigInt(usdtAmount)]).buffer),
        ]),
      });

      const transaction = new Transaction().add(transferInstruction);
      transaction.feePayer = fromPubkey;
      
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const { signature } = await phantom.signAndSendTransaction(transaction);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      return { hash: signature };
    } catch (error) {
      console.error('Phantom payment error:', error);
      throw error;
    }
  };

  // Send USDT payment via MetaMask (ERC20 on BSC/Polygon)
  const sendMetaMaskPayment = async (amountUSDT, evmPaymentAddress) => {
    const metamask = getMetaMask();
    if (!metamask) {
      throw new Error('MetaMask not connected');
    }

    try {
      // USDT contract addresses for different networks
      const USDT_CONTRACTS = {
        '0x1': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
        '0x38': '0x55d398326f99059fF775485246999027B3197955', // BSC
        '0x89': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon
      };

      const chainId = await metamask.request({ method: 'eth_chainId' });
      const usdtContract = USDT_CONTRACTS[chainId];
      
      if (!usdtContract) {
        throw new Error('Please switch to Ethereum, BSC, or Polygon network');
      }

      // USDT has 6 decimals on most chains (18 on BSC)
      const decimals = chainId === '0x38' ? 18 : 6;
      const amount = BigInt(Math.floor(amountUSDT * (10 ** decimals)));
      const amountHex = '0x' + amount.toString(16).padStart(64, '0');
      const toAddressHex = evmPaymentAddress.toLowerCase().replace('0x', '').padStart(64, '0');
      
      // ERC20 transfer function signature: transfer(address,uint256)
      const data = '0xa9059cbb' + toAddressHex + amountHex;

      const txHash = await metamask.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: usdtContract,
          data: data,
          gas: '0x15F90', // 90000 gas
        }],
      });

      return { hash: txHash };
    } catch (error) {
      console.error('MetaMask payment error:', error);
      throw error;
    }
  };

  // Universal payment function
  const sendPayment = async (amountUSDT, evmPaymentAddress = null) => {
    if (walletType === 'Phantom') {
      return await sendPhantomPayment(amountUSDT);
    } else if (walletType === 'MetaMask') {
      if (!evmPaymentAddress) {
        throw new Error('EVM payment address required for MetaMask');
      }
      return await sendMetaMaskPayment(amountUSDT, evmPaymentAddress);
    }
    throw new Error('No wallet connected');
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
