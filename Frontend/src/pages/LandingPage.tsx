import React, { useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import HowItWorksSection from '../components/HowItWorksSection';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
  useEffect(() => {
    // Update the page title
    document.title = 'SmartInvest Scout - Investment Research, Reimagined';
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;