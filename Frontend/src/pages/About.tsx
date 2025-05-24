import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Target, Search, Bot } from 'lucide-react';
import Header from '../components/Header';

const About: React.FC = () => {
  useEffect(() => {
    document.title = 'About - SmartInvest Scout';
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Sticky About Header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm pt-20 pb-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">About SmartInvest Scout</h1>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="space-y-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* What is SmartInvest Scout? */}
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg mr-5">
                <Compass className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">What is SmartInvest Scout?</h2>
                <div className="prose text-lg text-gray-700">
                  <p>
                    SmartInvest Scout is your personal AI-powered investment assistant. It helps you make smarter financial decisions by giving you real-time insights, personalized portfolio analysis, and the ability to understand complex reports — all in one place.
                  </p>
                  <p>
                    Think of it as a research analyst, financial planner, and stock market tutor rolled into a clean, chat-based experience.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Why We Built It */}
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg mr-5">
                <Target className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why We Built It</h2>
                <div className="prose text-lg text-gray-700">
                  <p>
                    Investing is complicated — and most platforms throw charts and data at users without real context.
                  </p>
                  <p>We wanted to build a platform that:</p>
                  <ul>
                    <li>Understands your intent</li>
                    <li>Simplifies financial documents</li>
                    <li>Gives you proactive insights on your portfolio</li>
                    <li>Lets you chat your way to clarity</li>
                  </ul>
                  <p>
                    Finance should feel empowering, not intimidating. That's what SmartInvest Scout stands for.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* How We're Different */}
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg mr-5">
                <Search className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We're Different</h2>
                <div className="prose text-lg text-gray-700">
                  <p>
                    Unlike traditional brokers or news apps, SmartInvest Scout:
                  </p>
                  <ul>
                    <li>Uses LLM technology to answer your financial questions naturally</li>
                    <li>Lets you upload documents like annual reports and extracts insights from them</li>
                    <li>Understands your portfolio, goals, and past behavior</li>
                    <li>Works across companies and market themes — from Reliance to green energy trends</li>
                  </ul>
                  <p>
                    We focus on intelligence, not transactions.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Powered by AI */}
          <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg mr-5">
                <Bot className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Powered by AI</h2>
                <div className="prose text-lg text-gray-700">
                  <p>
                    At the heart of SmartInvest Scout is OpenAI's Sonar API, giving it deep financial reasoning capabilities. Combined with user data, market context, and document parsing, the app delivers hyper-personalized and context-aware insights — far beyond what static dashboards offer.
                  </p>
                  <p>
                    This isn't just AI for show. It's AI that works for you.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section variants={itemVariants} className="text-center py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ready to make smarter investment decisions?</h2>
            <a 
              href="/dashboard" 
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3 rounded-lg transition-colors duration-300"
            >
              Get Started Now
            </a>
          </motion.section>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © {new Date().getFullYear()} SmartInvest Scout. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">Terms of Use</a>
              <a href="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors duration-300">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
