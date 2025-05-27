import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, PieChart, LineChart, BarChart } from 'lucide-react';
import Button from './Button';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4 transition-colors duration-300">
              Investment Research,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-400">
                Reimagined
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 md:pr-8 transition-colors duration-300">
              Ask questions. Get instant insights. Stay ahead of the market with
              AI-powered investment research.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Button
                label="Start Exploring"
                primary
                onClick={() => navigate('/dashboard')}
                icon="arrow-right"
              />
              <Button
                label="Learn More"
                secondary
                onClick={() => {
                  const howItWorks = document.getElementById('how-it-works');
                  howItWorks?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </motion.div>

          {/* Hero Animation/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-64 md:h-auto"
          >
            <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 md:p-8 overflow-hidden h-full transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full translate-y-1/2 -translate-x-1/2"></div>

              {/* Mock Dashboard/Search Results */}
              <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm dark:shadow-gray-900/30 p-4 mb-4 transition-all duration-300">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center transition-colors duration-300">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">
                    TSLA Market Insight
                  </h3>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-2 transition-colors duration-300"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-2 transition-colors duration-300"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6 transition-colors duration-300"></div>
              </div>

              <div className="flex space-x-3 mb-4">
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-3">
                  <PieChart className="h-5 w-5 text-indigo-500 mb-2" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-1 transition-colors duration-300"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 transition-colors duration-300"></div>
                </div>
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-3">
                  <LineChart className="h-5 w-5 text-purple-500 mb-2" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-1 transition-colors duration-300"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 transition-colors duration-300"></div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-sm dark:shadow-gray-900/30 p-4 transition-all duration-300">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center transition-colors duration-300">
                    <BarChart className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">Risk Analysis</h3>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-2 transition-colors duration-300"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6 mb-2 transition-colors duration-300"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5 transition-colors duration-300"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
