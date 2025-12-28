import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export const Hero = ({ onBuyClick }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0E14] via-[#1E1B4B] to-[#0B0E14]" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-200">Presale Now Live!</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Auralis
              </span>
              <br />
              <span className="text-white">Web3 Socialverse</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl">
              A chat where your 3D avatar comes alive with AI and earns tokens while you sleep. 
              Telegram + NFT + Gaming on Aptos blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onBuyClick}
                data-testid="hero-buy-ara-button"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 px-10 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:shadow-[0_0_40px_rgba(139,92,246,0.8)] hover:scale-105 transition-all duration-300 text-lg"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Buy ARA Token
              </Button>
              <Button
                variant="outline"
                data-testid="hero-learn-more-button"
                className="border-2 border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-bold py-6 px-10 rounded-full transition-all duration-300 text-lg backdrop-blur-sm"
              >
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div>
                <div className="text-3xl font-bold text-purple-400">$0.01</div>
                <div className="text-sm text-gray-400">Token Price</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">1B</div>
                <div className="text-sm text-gray-400">Total Supply</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400">20%</div>
                <div className="text-sm text-gray-400">Airdrop</div>
              </div>
            </div>
          </motion.div>

          {/* Right: Avatar Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-4 border-purple-500/20 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                  <img
                    src="https://images.pexels.com/photos/11798029/pexels-photo-11798029.jpeg"
                    alt="3D Avatar NFT"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />
                </div>
              </motion.div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
