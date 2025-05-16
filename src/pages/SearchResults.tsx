import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp, 
  Newspaper,
  ExternalLink
} from 'lucide-react';
import Button from '../components/Button';

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const { query } = useParams();

  useEffect(() => {
    document.title = `${query} - SmartInvest Scout`;
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Dashboard</span>
          </button>
          <Button
            label="Ask About This"
            icon="external-link"
            primary
            onClick={() => {/* TODO: Implement chat functionality */}}
          />
        </div>

        {/* Search Summary Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Showing insights for: {query}
          </h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleString()}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sonar Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Market Summary</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">What's Happening</h3>
                  <p className="text-gray-600">
                    Loading market insights...
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Key Drivers</h3>
                  <p className="text-gray-600">
                    Loading key drivers...
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Market Reaction</h3>
                  <p className="text-gray-600">
                    Loading market reaction...
                  </p>
                </div>
              </div>
            </motion.div>

            {/* News Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Newspaper className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Latest News</h2>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <h3 className="font-medium text-gray-900 mb-1">
                      Loading news headline...
                    </h3>
                    <p className="text-sm text-gray-600">
                      Loading news summary...
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Risk Factors Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-amber-100 rounded-lg p-2">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Risk Factors</h2>
              </div>
              <div className="space-y-3">
                {['Regulatory', 'Competition', 'Product Delays'].map((risk, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2" />
                    <div>
                      <h3 className="font-medium text-gray-900">{risk}</h3>
                      <p className="text-sm text-gray-600">Loading risk details...</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Ask Follow-up Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 rounded-lg p-2">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Ask Follow-up</h2>
              </div>
              <div className="space-y-3">
                {[
                  "What should I know as a long-term investor?",
                  "What are the growth prospects?",
                  "How does this compare to competitors?"
                ].map((question, i) => (
                  <button
                    key={i}
                    className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;