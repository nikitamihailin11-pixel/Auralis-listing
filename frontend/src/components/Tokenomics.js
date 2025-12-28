import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Coins } from 'lucide-react';

const tokenomicsData = [
  { name: 'Community & Airdrop', value: 40, color: '#d4a853' },
  { name: 'Team (vested)', value: 20, color: '#4dd4e8' },
  { name: 'Liquidity', value: 15, color: '#87e8f5' },
  { name: 'Ecosystem', value: 15, color: '#c87840' },
  { name: 'Marketing', value: 10, color: '#f5d485' },
];

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const Tokenomics = () => {
  return (
    <div className="relative py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#162234] to-[#0d1117]" />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4a853] rounded-full blur-[200px] opacity-10" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass-effect px-4 py-2 rounded-full mb-6 border border-[#d4a853]/30">
            <Coins className="w-4 h-4 text-[#d4a853]" />
            <span className="text-sm font-semibold text-[#d4a853]">TOKEN ECONOMICS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-gradient-gold">Tokenomics</span>
          </h2>
          <p className="text-xl text-gray-400">ARA Token Distribution</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-effect border border-white/10 rounded-3xl p-8"
          >
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={tokenomicsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={140}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tokenomicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="glass-effect border border-[#d4a853]/20 rounded-2xl p-6">
              <div className="text-sm text-gray-400 mb-1">Total Supply</div>
              <div className="text-3xl font-bold text-white">1,000,000,000 ARA</div>
            </div>

            <div className="glass-effect border border-[#4dd4e8]/20 rounded-2xl p-6">
              <div className="text-sm text-gray-400 mb-1">Token Price</div>
              <div className="text-3xl font-bold text-gradient-gold">
                $0.01 USDT
              </div>
            </div>

            <div className="space-y-3">
              {tokenomicsData.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 glass-effect border border-white/10 rounded-xl p-4"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1">
                    <div className="text-white font-semibold">{item.name}</div>
                  </div>
                  <div className="text-gray-300 font-bold">{item.value}%</div>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-[#d4a853]/10 to-[#4dd4e8]/10 border border-[#d4a853]/20 rounded-2xl p-6 mt-6">
              <div className="text-sm text-gray-300 mb-2">⚡ Key Features</div>
              <ul className="space-y-2 text-gray-400">
                <li>• 20% tokens for community airdrop</li>
                <li>• 0.15% burn on each transaction (deflationary)</li>
                <li>• Staking APY: 15-25%</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
