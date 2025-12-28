import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  en: {
    // Hero
    presaleNow: 'Presale Now Live!',
    heroTitle1: 'Auralis',
    heroTitle2: 'Web3 Socialverse',
    heroDescription: 'A chat where your 3D avatar comes alive with AI and earns tokens while you sleep. Telegram + NFT + Gaming on Aptos blockchain.',
    buyARAToken: 'Buy ARA Token',
    learnMore: 'Learn More',
    tokenPrice: 'Token Price',
    totalSupply: 'Total Supply',
    airdrop: 'Airdrop',
    
    // Token Sale
    buyARATokens: 'Buy ARA Tokens',
    secureTokens: 'Secure your tokens at presale price',
    presaleEndsIn: 'Presale Ends In',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    saleProgress: 'Sale Progress',
    sold: 'Sold',
    selectWallet: 'Select Wallet',
    connectWallet: 'Connect',
    connected: 'Connected',
    connectedAddress: 'Connected Address',
    araTokenQuantity: 'ARA Token Quantity',
    enterQuantity: 'Enter quantity (e.g., 1000)',
    pricePerToken: 'Price per token:',
    quantity: 'Quantity:',
    totalCost: 'Total Cost:',
    createPurchaseOrder: 'Create Purchase Order',
    processing: 'Processing...',
    tokensDistributed: 'Tokens will be automatically distributed after presale ends',
    
    // Payment Modal
    orderPayment: 'Order Payment',
    confirmTransaction: 'Confirm transaction in your wallet',
    quantityARA: 'ARA Quantity:',
    recipientAddress: 'Recipient Address:',
    automaticPayment: '💳 Automatic Payment',
    paymentDescription: 'Click the button below to open your wallet and confirm the transaction. Payment will be sent automatically.',
    payNow: '💳 Pay Now',
    processing: 'Processing...',
    tokensAfterPresale: 'Tokens will be automatically distributed after presale ends',
    
    // Success Modal
    paymentReceived: 'Payment Received!',
    orderProcessed: 'Your order has been successfully processed',
    tokensPurchased: 'Tokens Purchased',
    distributionDate: 'Distribution Date',
    tokensWillBe: 'Your',
    tokensText: 'tokens',
    autoDistributed: 'will be automatically credited to your wallet:',
    expectedDate: 'Expected date:',
    aprilJune2026: 'April-June 2026',
    great: 'Great!',
    followUpdates: 'Follow updates on our social media',
    
    // Features
    whatIsAuralis: 'What is Auralis?',
    platformDescription: 'A platform combining messenger, NFT economy, and 3D game on Aptos blockchain',
    web3Messenger: 'Web3 Messenger',
    web3MessengerDesc: 'Chats, groups, channels like Telegram, but with NFT stickers and blockchain security',
    '3DAvatars': '3D Avatars',
    '3DAvatarsDesc': 'Create a unique NFT avatar with AR face scan. Over 1000 customization options',
    openWorldGame: 'Open World Game',
    openWorldGameDesc: 'Full 3D game with open world where avatars come alive thanks to AI',
    aiPassiveIncome: 'AI Passive Income',
    aiPassiveIncomeDesc: 'Your avatar earns 24/7: farms, trades, completes quests while you sleep',
    
    // Tokenomics
    tokenomics: 'Tokenomics',
    araTokenDistribution: 'ARA Token Distribution',
    communityAirdrop: 'Community & Airdrop',
    teamVested: 'Team (vested)',
    liquidity: 'Liquidity',
    ecosystem: 'Ecosystem',
    marketing: 'Marketing',
    features: '⚡ Features',
    feature1: '• 20% tokens for airdrop (early users)',
    feature2: '• Burn 0.15% per transaction (deflationary)',
    feature3: '• Staking APY: 15-25%',
    
    // Roadmap
    roadmap: 'Roadmap',
    pathToMetaverse: 'Path to full metaverse',
    q1_2026: 'Q1 2026',
    messengerLaunch: 'Messenger Launch',
    q1Item1: 'Messenger launch (chats, groups, channels)',
    q1Item2: 'Airdrop phase 1 (100-500 ARA for activity)',
    q1Item3: 'Basic 3D avatars',
    q2_2026: 'Q2 2026',
    marketplaceWallet: 'Marketplace & Wallet',
    q2Item1: 'DEX on Aptos for NFT trading',
    q2Item2: 'Built-in non-custodial wallet',
    q2Item3: 'Premium features',
    q3_2026: 'Q3 2026',
    '3dIntegration': '3D Integration',
    q3Item1: '3D video chats with avatars',
    q3Item2: 'AI agents beta (autonomous actions)',
    q3Item3: 'AR scan for avatars',
    q4_2026: 'Q4 2026',
    fullGameLaunch: 'Full Game Launch',
    q4Item1: 'Open 3D world',
    q4Item2: 'Avatars come alive with AI (24/7)',
    q4Item3: 'Passive income through AI agents',
    '2027plus': '2027+',
    expansion: 'Expansion',
    exp1: 'Mobile VR support',
    exp2: 'Cross-chain integrations',
    exp3: 'Brand partnerships (NFT clothing)',
    
    // Footer
    yourPortal: 'Your gateway to the infinite digital soul',
    onAptos: 'on Aptos blockchain',
    links: 'Links',
    buyARA: 'Buy ARA',
    whitepaper: 'Whitepaper',
    documentation: 'Documentation',
    faq: 'FAQ',
    socialMedia: 'Social Media',
    allRightsReserved: 'All rights reserved.',
  },
  
  ru: {
    // ... (keep existing Russian translations)
  },
  
  es: {
    // ... (keep existing Spanish translations)
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('auralis_language');
    return saved || 'en'; // Changed default to English
  });

  useEffect(() => {
    localStorage.setItem('auralis_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
