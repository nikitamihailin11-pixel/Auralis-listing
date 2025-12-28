import React from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { Button } from './ui/button';

export const Hero = ({ onBuyClick }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background Texture */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1764263996369-141150443ebf?crop=entropy&cs=srgb&fm=jpg&q=85')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Animated Glow Elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#CCFF00] rounded-full blur-[150px] opacity-10 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#00F0FF] rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="flex flex-col items-center text-center">
          {/* Massive Title Behind Avatar */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="font-outfit font-black text-8xl md:text-[14rem] tracking-tighter uppercase leading-[0.9] mb-8"
            style={{
              background: 'linear-gradient(to right, #CCFF00, #00F0FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            AURALIS
          </motion.h1>

          {/* 3D Avatar - Floating */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative mb-12 animate-float"
          >
            <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-[#CCFF00] neon-glow">
              <img
                src="https://images.unsplash.com/photo-1564035355568-a1ecb8f31982?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="3D Astronaut Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-2xl md:text-3xl font-outfit font-bold text-[#F0F0F0] mb-4 tracking-tight uppercase"
          >
            Defy Gravity. Own the Void.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg text-[#888888] max-w-2xl mb-12"
          >
            A chat where your 3D avatar comes alive with AI and earns tokens while you sleep. 
            Telegram + NFT + Gaming on Aptos blockchain.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Button
              onClick={onBuyClick}
              data-testid="hero-buy-ara-button"
              className="bg-[#CCFF00] hover:bg-[#B3E600] text-black font-bold text-lg px-12 py-7 rounded-full neon-glow transition-all duration-300 hover:scale-105"
            >
              <Rocket className="w-6 h-6 mr-2" />
              JOIN PRESALE
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid grid-cols-3 gap-6 mt-16"
          >
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-outfit font-black text-[#CCFF00]">$0.01</div>
              <div className="text-sm text-[#888888] uppercase tracking-wider mt-1">Token Price</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-outfit font-black text-[#00F0FF]">1B</div>
              <div className="text-sm text-[#888888] uppercase tracking-wider mt-1">Total Supply</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-outfit font-black text-[#FF4D00]">20%</div>
              <div className="text-sm text-[#888888] uppercase tracking-wider mt-1">Airdrop</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
