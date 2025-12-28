import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, User, Gamepad2, Sparkles } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Web3 Messenger',
    description: 'Чаты, группы, каналы как в Telegram, но с NFT-стикерами и блокчейн-безопасностью',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: User,
    title: '3D Avatars',
    description: 'Создай уникального аватара-NFT с AR-сканом лица. Более 1000 вариантов кастомизации',
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Gamepad2,
    title: 'Open World Game',
    description: 'Полноценная 3D-игра с открытым миром, где аватары оживают благодаря AI',
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Sparkles,
    title: 'AI Passive Income',
    description: 'Твой аватар зарабатывает 24/7: фармит, торгует, выполняет квесты пока ты спишь',
    gradient: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
  },
];

export const Features = () => {
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
            Что такое Auralis?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Платформа, которая объединяет мессенджер, NFT-экономику и 3D-игру на блокчейне Aptos
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
              className="group relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur-md hover:border-purple-500/50 transition-all duration-300"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-7 h-7 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} style={{WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text'}} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
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
