import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Wallet } from 'lucide-react';
import { Button } from './ui/button';
import { useWallet } from '../context/WalletContext';

const AVATAR_URL = 'https://customer-assets.emergentagent.com/job_auralis-app/artifacts/54orsfy0_7a153b1b-b478-48c5-a9e3-246632224b62.jpg';

export const Hero = ({ onBuyClick }) => {
  const { isConnected, walletAddress, walletType, connectPhantom, connectMetaMask, disconnect } = useWallet();

  return (
    <div className="relative min-h-screen flex items-center overflow-hidden aurora-bg globe-pattern">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#4dd4e8] rounded-full blur-[150px] opacity-20" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#d4a853] rounded-full blur-[150px] opacity-15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a5070] rounded-full blur-[200px] opacity-30" />
      </div>

      {/* Network lines overlay */}
      <div className="absolute inset-0 network-lines opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-effect px-4 py-2 rounded-full mb-6 border border-[#d4a853]/30"
            >
              <Sparkles className="w-4 h-4 text-[#d4a853]" />
              <span className="text-sm font-semibold text-[#d4a853]">PRESALE NOW LIVE</span>
            </motion.div>

            {/* Main heading */}
            <h1 className="font-outfit font-black text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
              <span className="text-gradient-gold">AURALIS</span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-outfit font-bold text-white mb-3 flex items-center gap-3">
              <Globe className="w-8 h-8 text-[#4dd4e8]" />
              Global Web3 Community
            </p>
            
            <p className="text-lg text-gray-300 mb-8 leading-relaxed max-w-lg">
              Join the decentralized social network where your 3D avatar comes alive with AI and earns tokens while you connect with people worldwide.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {!isConnected ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={connectPhantom}
                    className="h-14 px-6 text-base font-bold bg-gradient-to-r from-[#AB9FF2] to-[#9945FF] hover:from-[#BDB4F5] hover:to-[#AB56FF] text-white rounded-2xl transition-all hover:scale-105"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Phantom
                  </Button>
                  <Button 
                    onClick={connectMetaMask}
                    className="h-14 px-6 text-base font-bold bg-gradient-to-r from-[#E2761B] to-[#F6851B] hover:from-[#F5923B] hover:to-[#FFA03B] text-white rounded-2xl transition-all hover:scale-105"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect MetaMask
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <Button 
                    onClick={onBuyClick} 
                    data-testid="hero-buy-ara-button"
                    className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-[#d4a853] to-[#c87840] hover:from-[#e5b964] hover:to-[#d98950] text-[#0d1117] rounded-2xl glow-gold transition-all hover:scale-105"
                  >
                    BUY ARA TOKENS
                  </Button>
                  <div className="glass-effect rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <span className="text-xs text-gray-400 block">{walletType}</span>
                      <span className="text-sm text-white font-mono">
                        {walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}
                      </span>
                    </div>
                    <button 
                      onClick={disconnect}
                      className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-effect p-4 rounded-xl border border-[#d4a853]/20"
              >
                <div className="text-3xl font-black text-gradient-gold">$0.01</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Token Price</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-effect p-4 rounded-xl border border-[#4dd4e8]/20"
              >
                <div className="text-3xl font-black text-gradient-sky">1B</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Total Supply</div>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-effect p-4 rounded-xl border border-[#c87840]/20"
              >
                <div className="text-3xl font-black text-[#c87840]">20%</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Airdrop</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right - Avatar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8, delay: 0.4 }} 
            className="relative flex justify-center"
          >
            <div className="relative animate-float">
              {/* Glow behind avatar */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#4dd4e8]/30 to-[#d4a853]/30 rounded-3xl blur-3xl scale-110" />
              
              {/* Avatar container */}
              <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-3xl overflow-hidden glass-effect glow-sky border-2 border-white/10">
                <img 
                  src={AVATAR_URL}
                  alt="Auralis 3D Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
