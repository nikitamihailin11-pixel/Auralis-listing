import React, { useRef } from 'react';
import "./App.css";
import { WalletProvider } from './context/WalletContext';
import { Hero } from './components/Hero';
import { TokenSale } from './components/TokenSale';
import { Features } from './components/Features';
import { Tokenomics } from './components/Tokenomics';
import { Roadmap } from './components/Roadmap';
import { Footer } from './components/Footer';
import { Toaster } from 'sonner';

function App() {
  const tokenSaleRef = useRef(null);

  const scrollToBuy = () => {
    tokenSaleRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <WalletProvider>
      <div className="App min-h-screen bg-[#0B0E14] text-white overflow-x-hidden">
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
  );
}

export default App;
