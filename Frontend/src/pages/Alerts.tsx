import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, Filter, RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import AlertFeed from '../components/AlertFeed';
import AlertPreferences from '../components/AlertPreferences';
import { useAuth } from '../contexts/AuthContext';

const Alerts: React.FC = () => {
  const { user } = useAuth();
  const [showPreferences, setShowPreferences] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  // Redirect if user is not logged in
  React.useEffect(() => {
    if (!user) {
      // Handle not logged in state if needed
      // For now we'll just let the ProtectedRoute handle this
    }
  }, [user]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-8 w-8 mr-3 text-indigo-600" />
                Market Alerts
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowPreferences(!showPreferences)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 flex items-center"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {showPreferences ? 'Hide Preferences' : 'Preferences'}
                </button>
              </div>
            </div>
            <p className="mt-2 text-lg text-gray-600">
              Stay informed about market events that matter to you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className={`${showPreferences ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              {/* Alert Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg shadow-md p-4 mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-indigo-600" />
                    Filter Alerts
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['All', 'Earnings', 'Strategy', 'Regulatory', 'Product', 'Analyst', 'Macro', 'Sentiment'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveFilter(category)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === category ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Alert Feed */}
              <motion.div
                key={refreshKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <AlertFeed 
                  limit={50} 
                  showHeader={false} 
                  filterCategory={activeFilter !== 'All' ? activeFilter : undefined} 
                />
              </motion.div>
            </div>

            {/* Preferences Panel */}
            {showPreferences && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="lg:col-span-1"
              >
                <AlertPreferences 
                  onSaved={handleRefresh}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © {new Date().getFullYear()} SmartInvest Scout. All rights
              reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a
                href="/"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Home
              </a>
              <a
                href="/features"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Features
              </a>
              <a
                href="/privacy"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <a
                href="/about"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                About
              </a>
              <a
                href="/pricing"
                className="text-gray-600 hover:text-indigo-600 transition-colors duration-300"
              >
                Pricing
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Alerts;
