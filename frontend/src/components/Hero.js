import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export const Hero = ({ onBuyClick }) => {
  return (
    <div className="relative min-h-screen flex items-center overflow-hidden aurora-bg">
      {/* Aurora Effect Layers */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#9D7FFF] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#4DD4E8] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 glass-effect px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#4DD4E8]" />
              <span className="text-sm font-semibold text-[#4DD4E8]">PRESALE NOW LIVE</span>
            </motion.div>

            <h1 className="font-outfit font-black text-6xl md:text-8xl mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#9D7FFF] to-[#4DD4E8] bg-clip-text text-transparent">
                AURALIS
              </span>
            </h1>

            <p className="text-2xl md:text-3xl font-outfit font-bold text-white mb-4">
              Web3 Socialverse
            </p>

            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              A chat where your 3D avatar comes alive with AI and earns tokens while you sleep. 
              Telegram + NFT + Gaming on Aptos blockchain.
            </p>

            <Button
              onClick={onBuyClick}
              data-testid="hero-buy-ara-button"
              className="bg-gradient-to-r from-[#9D7FFF] to-[#B34DFF] hover:from-[#8B6FE6] hover:to-[#9D3FE6] text-white font-bold text-lg px-10 py-6 rounded-2xl glow-violet transition-all duration-300"
            >
              BUY ARA TOKENS
            </Button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              <div className="glass-effect p-4 rounded-xl">
                <div className="text-3xl font-black text-[#9D7FFF]">$0.01</div>
                <div className="text-xs text-gray-400 uppercase">Price</div>
              </div>
              <div className="glass-effect p-4 rounded-xl">
                <div className="text-3xl font-black text-[#4DD4E8]">1B</div>
                <div className="text-xs text-gray-400 uppercase">Supply</div>
              </div>
              <div className="glass-effect p-4 rounded-xl">
                <div className="text-3xl font-black text-[#B34DFF]">20%</div>
                <div className="text-xs text-gray-400 uppercase">Airdrop</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative animate-float">
              <div className="w-full aspect-square rounded-3xl overflow-hidden glass-effect glow-cyan">
                <img
                  src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80"
                  alt="3D Avatar"
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
