import React, { useRef, useState } from 'react';
import "./App.css";
import { WalletProvider } from './context/WalletContext';
import { LanguageProvider } from './context/LanguageContext';
import { Hero } from './components/Hero';
import { TokenSale } from './components/TokenSale';
import { Features } from './components/Features';
import { Tokenomics } from './components/Tokenomics';
import { Roadmap } from './components/Roadmap';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { Toaster } from 'sonner';
import { Settings } from 'lucide-react';
import { Button } from './components/ui/button';

function App() {
  const tokenSaleRef = useRef(null);
  const [showAdmin, setShowAdmin] = useState(false);

  const scrollToBuy = () => {
    tokenSaleRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (showAdmin) {
    return (
      <LanguageProvider>
        <WalletProvider>
          <AdminPanel onBack={() => setShowAdmin(false)} />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(30, 27, 75, 0.95)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
              },
            }}
          />
        </WalletProvider>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <WalletProvider>
        <div className="App min-h-screen bg-[#0B0E14] text-white overflow-x-hidden">
          {/* Admin Button */}
          <Button
            onClick={() => setShowAdmin(true)}
            className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg flex items-center justify-center"
            title="Admin Panel"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Hero Section */}
          <Hero onBuyClick={scrollToBuy} />

          {/* Token Sale Section */}
          <div ref={tokenSaleRef}>
            <TokenSale />
          </div>

          {/* Features Section */}
          <Features />

          {/* Tokenomics Section */}
          <Tokenomics />

          {/* Roadmap Section */}
          <Roadmap />

          {/* Footer */}
          <Footer />

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(30, 27, 75, 0.95)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
              },
            }}
          />
        </div>
      </WalletProvider>
    </LanguageProvider>
  );
}

export default App;
