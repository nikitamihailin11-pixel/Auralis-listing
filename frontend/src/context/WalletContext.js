import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';
import '@solana/wallet-adapter-react-ui/styles.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const SOLANA_PAYMENT_ADDRESS = 'C8G8Wir2RBNW5bwwrtS4wcpapKqw5abNMXdVjQSGsS21';
const SOLANA_NETWORK = 'mainnet-beta';

const WalletContext = createContext();

// Inner provider that uses Solana wallet hooks
function WalletContextProvider({ children }) {
  const { connection } = useConnection();
  const { publicKey, connected, wallet, sendTransaction, disconnect } = useSolanaWallet();
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState({ totalTokens: 0, totalSpent: 0 });
  const [solBalance, setSolBalance] = useState(null);

  const walletAddress = publicKey?.toString() || null;
  const walletType = wallet?.adapter?.name || null;

  // Fetch SOL balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) {
      setSolBalance(null);
      return;
    }
    try {
      const balance = await connection.getBalance(publicKey);
      setSolBalance((balance / LAMPORTS_PER_SOL).toFixed(4));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setSolBalance(null);
    }
  }, [publicKey, connection]);

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

  // Save wallet to backend on connect
  const saveWalletToBackend = useCallback(async () => {
    if (!walletAddress) return;
    try {
      await axios.post(`${API}/wallets/connect`, {
        address: walletAddress,
        blockchain: 'solana',
        balance: parseFloat(solBalance) || 0
      });
    } catch (error) {
      console.error('Failed to save wallet to backend:', error);
    }
  }, [walletAddress, solBalance]);

  // Send SOL payment (USDT equivalent - using SOL for now)
  const sendPayment = useCallback(async (amountUSD) => {
    if (!publicKey || !connection) {
      throw new Error('Wallet not connected');
    }

    try {
      const recipientPubKey = new PublicKey(SOLANA_PAYMENT_ADDRESS);
      
      // Convert USD to lamports (assuming 1 SOL = ~$150 for estimation, user pays in SOL)
      // For actual USDT, we would use SPL token transfer
      const lamports = Math.floor(amountUSD * LAMPORTS_PER_SOL * 0.01); // Small amount for testing

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: lamports,
        })
      );

      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      });

      return { hash: signature };
    } catch (error) {
      console.error('Payment failed:', error);
      throw error;
    }
  }, [publicKey, connection, sendTransaction]);

  // Effects
  useEffect(() => {
    if (connected && walletAddress) {
      fetchBalance();
      fetchUserOrders(walletAddress);
      saveWalletToBackend();
    } else {
      setSolBalance(null);
      setUserOrders([]);
      setUserStats({ totalTokens: 0, totalSpent: 0 });
    }
  }, [connected, walletAddress, fetchBalance, fetchUserOrders, saveWalletToBackend]);

  const value = {
    // Connection state
    isConnected: connected,
    walletAddress,
    walletType,
    solBalance,
    
    // User data
    userOrders,
    userStats,
    
    // Actions
    sendPayment,
    fetchUserOrders,
    disconnect,
    fetchBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

// Main provider wrapper with Solana providers
export function WalletProvider({ children }) {
  const endpoint = useMemo(() => clusterApiUrl(SOLANA_NETWORK), []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(), // This enables MetaMask via Solflare snap
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextProvider>{children}</WalletContextProvider>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Export Solana wallet hook for direct access to wallet modal
export { useSolanaWallet as useSolanaWalletDirect };
