import React from 'react';
import { Twitter, Send, Github, FileText, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { Button } from './ui/button';

const WHITEPAPER_URL = 'https://customer-assets.emergentagent.com/job_auralis-app/artifacts/ifdo8z4t_Whitepaper.pdf';

export const Footer = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="relative py-12 border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] to-transparent" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              Auralis
            </h3>
            <p className="text-gray-400 text-sm">
              {t('yourPortal')}<br />
              {t('onAptos')}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-white font-bold mb-4">{t('links')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#buy" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('buyARA')}
                </a>
              </li>
              <li>
                <a 
                  href={WHITEPAPER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-purple-400 transition-colors inline-flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {t('whitepaper')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('documentation')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  {t('faq')}
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
            <h4 className="text-white font-bold mb-4">{t('socialMedia')}</h4>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
              >
                <Twitter className="w-5 h-5 text-gray-400 hover:text-purple-400" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
              >
                <Send className="w-5 h-5 text-gray-400 hover:text-purple-400" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/50 transition-all"
              >
                <Github className="w-5 h-5 text-gray-400 hover:text-purple-400" />
              </a>
            </div>
          </motion.div>

          {/* Language Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language
            </h4>
            <div className="flex flex-col gap-2">
              {[
                { code: 'ru', name: 'Русский' },
                { code: 'en', name: 'English' },
                { code: 'es', name: 'Español' },
              ].map((lang) => (
                <Button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  variant={language === lang.code ? 'default' : 'outline'}
                  size="sm"
                  className={`justify-start ${ 
                    language === lang.code
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {lang.name}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 Auralis. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};
