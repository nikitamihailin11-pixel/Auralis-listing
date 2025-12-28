import React from 'react';
import { Twitter, Send, Github, FileText, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const WHITEPAPER_URL = 'https://customer-assets.emergentagent.com/job_auralis-app/artifacts/ifdo8z4t_Whitepaper.pdf';

export const Footer = () => {
  return (
    <footer className="relative py-12 border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold text-gradient-gold mb-3">
              Auralis
            </h3>
            <p className="text-gray-400 text-sm">
              Your portal to the Web3 metaverse<br />
              Built on Solana blockchain
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#buy" className="text-gray-400 hover:text-[#d4a853] transition-colors">
                  Buy ARA
                </a>
              </li>
              <li>
                <a 
                  href={WHITEPAPER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#d4a853] transition-colors inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Whitepaper
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#d4a853] transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#d4a853] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-white font-bold mb-4">Community</h4>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass-effect border border-white/10 flex items-center justify-center hover:bg-[#d4a853]/20 hover:border-[#d4a853]/50 transition-all"
              >
                <Twitter className="w-5 h-5 text-gray-400 hover:text-[#d4a853]" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass-effect border border-white/10 flex items-center justify-center hover:bg-[#4dd4e8]/20 hover:border-[#4dd4e8]/50 transition-all"
              >
                <Send className="w-5 h-5 text-gray-400 hover:text-[#4dd4e8]" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass-effect border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all"
              >
                <Github className="w-5 h-5 text-gray-400 hover:text-white" />
              </a>
            </div>
          </motion.div>

          {/* Network */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#4dd4e8]" />
              Network
            </h4>
            <div className="glass-effect rounded-xl p-4 border border-[#4dd4e8]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center">
                  <span className="text-white font-bold text-xs">SOL</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Solana</p>
                  <p className="text-gray-400 text-xs">Mainnet Beta</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Payments accepted: USDT (SPL)
            </p>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Auralis. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
