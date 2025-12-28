import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Gamepad2, Sparkles, Globe, Users } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with people worldwide through decentralized messaging with blockchain security',
    gradient: 'from-[#4dd4e8] to-[#87e8f5]',
    bgColor: 'bg-[#4dd4e8]/10',
    borderColor: 'border-[#4dd4e8]/20',
  },
  {
    icon: User,
    title: '3D Avatars',
    description: 'Create unique NFT avatars with AR face scanning. Over 1000 customization options',
    gradient: 'from-[#d4a853] to-[#f5d485]',
    bgColor: 'bg-[#d4a853]/10',
    borderColor: 'border-[#d4a853]/20',
  },
  {
    icon: Gamepad2,
    title: 'Open World Game',
    description: 'Full 3D game with open world where avatars come alive through AI technology',
    gradient: 'from-[#4dd4e8] to-[#87e8f5]',
    bgColor: 'bg-[#4dd4e8]/10',
    borderColor: 'border-[#4dd4e8]/20',
  },
  {
    icon: Sparkles,
    title: 'AI Passive Income',
    description: 'Your avatar earns 24/7: farming, trading, completing quests while you sleep',
    gradient: 'from-[#c87840] to-[#d4a853]',
    bgColor: 'bg-[#c87840]/10',
    borderColor: 'border-[#c87840]/20',
  },
];

export const Features = () => {
  return (
    <div className="relative py-20 md:py-32">
      <div className="absolute inset-0 aurora-bg" />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-[#4dd4e8] rounded-full blur-[180px] opacity-10" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-[#d4a853] rounded-full blur-[180px] opacity-10" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass-effect px-4 py-2 rounded-full mb-6 border border-[#4dd4e8]/30">
            <Users className="w-4 h-4 text-[#4dd4e8]" />
            <span className="text-sm font-semibold text-[#4dd4e8]">PLATFORM FEATURES</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What is <span className="text-gradient-gold">Auralis</span>?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            A platform that unites messenger, NFT economy, and 3D gaming on the Solana blockchain
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`group relative overflow-hidden rounded-3xl glass-effect p-8 border ${feature.borderColor} hover:border-[#d4a853]/50 transition-all duration-300`}
            >
              {/* Hover gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.gradient}`} style={{color: feature.gradient.includes('d4a853') ? '#d4a853' : '#4dd4e8'}} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#d4a853] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
