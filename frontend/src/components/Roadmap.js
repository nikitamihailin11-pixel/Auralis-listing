import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Map } from 'lucide-react';

const roadmapData = [
  {
    quarter: 'Q1 2026',
    title: 'Messenger Launch',
    items: [
      'Launch messenger (chats, groups, channels)',
      'Airdrop phase 1 (1000-5000 ARA for activity)',
      'Basic 3D avatars',
    ],
    status: 'current',
  },
  {
    quarter: 'Q2 2026',
    title: 'Marketplace & Wallet',
    items: [
      'DEX on Solana for NFT trading',
      'Built-in non-custodial wallet',
      'Premium features',
    ],
    status: 'upcoming',
  },
  {
    quarter: 'Q3 2026',
    title: '3D Integration',
    items: [
      '3D video chats with avatars',
      'AI agents beta (autonomous actions)',
      'AR scan for avatars',
    ],
    status: 'upcoming',
  },
  {
    quarter: 'Q4 2026',
    title: 'Full Game Launch',
    items: [
      'Open 3D world',
      'Avatars come alive with AI (24/7)',
      'Passive income through AI agents',
    ],
    status: 'upcoming',
  },
  {
    quarter: '2027+',
    title: 'Global Expansion',
    items: [
      'Mobile VR support',
      'Cross-chain integrations',
      'Brand partnerships (NFT clothing)',
    ],
    status: 'upcoming',
  },
];

export const Roadmap = () => {
  return (
    <div className="relative py-20 md:py-32">
      <div className="absolute inset-0 aurora-bg" />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#4dd4e8] rounded-full blur-[200px] opacity-10" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-[#d4a853] rounded-full blur-[200px] opacity-10" />
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
            <Map className="w-4 h-4 text-[#4dd4e8]" />
            <span className="text-sm font-semibold text-[#4dd4e8]">DEVELOPMENT PLAN</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-gradient-sky">Roadmap</span>
          </h2>
          <p className="text-xl text-gray-400">The path to a complete metaverse</p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#d4a853] via-[#4dd4e8] to-[#d4a853]" />

          {/* Roadmap Items */}
          <div className="space-y-12">
            {roadmapData.map((phase, index) => (
              <motion.div
                key={phase.quarter}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-8 md:left-1/2 -ml-3 md:-ml-4 flex items-center justify-center">
                  {phase.status === 'current' ? (
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#d4a853] to-[#c87840] animate-pulse shadow-[0_0_20px_rgba(212,168,83,0.6)]" />
                  ) : (
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 border-2 border-white/20" />
                  )}
                </div>

                {/* Content Card */}
                <div
                  className={`ml-20 md:ml-0 md:w-5/12 ${
                    index % 2 === 0 ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'
                  }`}
                >
                  <div
                    className={`glass-effect rounded-3xl p-6 border ${
                      phase.status === 'current'
                        ? 'border-[#d4a853]/50 shadow-[0_0_30px_rgba(212,168,83,0.2)]'
                        : 'border-white/10'
                    } hover:border-[#d4a853]/50 hover:shadow-[0_0_30px_rgba(212,168,83,0.15)] transition-all duration-300`}
                  >
                    {/* Quarter Badge */}
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mb-3 ${
                        phase.status === 'current'
                          ? 'bg-gradient-to-r from-[#d4a853] to-[#c87840] text-[#0d1117]'
                          : 'bg-white/10 text-gray-300'
                      }`}
                    >
                      {phase.quarter}
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-4">{phase.title}</h3>

                    {/* Items */}
                    <ul className="space-y-2">
                      {phase.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-gray-300">
                          {phase.status === 'current' ? (
                            <CheckCircle className="w-5 h-5 text-[#d4a853] flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                          )}
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
