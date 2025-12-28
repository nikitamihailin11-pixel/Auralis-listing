import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

const roadmapData = [
  {
    quarter: 'Q1 2026',
    title: 'Messenger Launch',
    items: [
      'Запуск мессенджера (чаты, группы, каналы)',
      'Airdrop фаза 1 (100-500 ARA за активность)',
      'Базовые 3D-аватары',
    ],
    status: 'current',
  },
  {
    quarter: 'Q2 2026',
    title: 'Marketplace & Wallet',
    items: [
      'DEX на Aptos для NFT-трейдинга',
      'Встроенный non-custodial кошелек',
      'Premium-функции',
    ],
    status: 'upcoming',
  },
  {
    quarter: 'Q3 2026',
    title: '3D Integration',
    items: [
      '3D-видеочаты с аватарами',
      'AI-агенты beta (автономные действия)',
      'AR-скан для аватаров',
    ],
    status: 'upcoming',
  },
  {
    quarter: 'Q4 2026',
    title: 'Full Game Launch',
    items: [
      'Открытый 3D-мир',
      'Аватары оживают с AI (24/7)',
      'Пассивный доход через AI-агентов',
    ],
    status: 'upcoming',
  },
  {
    quarter: '2027+',
    title: 'Expansion',
    items: [
      'Mobile VR поддержка',
      'Cross-chain интеграции',
      'Партнерства с брендами (NFT-одежда)',
    ],
    status: 'upcoming',
  },
];

export const Roadmap = () => {
  return (
    <div className="relative py-20 md:py-32">
      <div className="absolute inset-0 bg-[#0B0E14]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Roadmap
          </h2>
          <p className="text-xl text-gray-400">Путь к полной метавселенной</p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-pink-500 to-green-500" />

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
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.6)]" />
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
                    className={`bg-white/5 backdrop-blur-xl border rounded-3xl p-6 ${
                      phase.status === 'current'
                        ? 'border-purple-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]'
                        : 'border-white/10'
                    } hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] transition-all duration-300`}
                  >
                    {/* Quarter Badge */}
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold mb-3 ${
                        phase.status === 'current'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
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
                            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
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
