/**
 * @file Dashboard page component
 * @description Main dashboard with search, quick actions, and suggested topics
 */

import React, { useState, useEffect } from "react";
import { DocumentSummary } from "../lib/api";
import { saveSearchQuery, getRecentSearches } from "../lib/api/search";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SearchSuggestions from "../components/SearchSuggestions";
import { useAuth } from "../contexts/AuthContext";
import {
  MessageSquare,
  Upload,
  TrendingUp,
  Bitcoin,
  Leaf,
  DollarSign,
  Clock,
  ChevronRight,
  BarChart,
  Activity,
} from "lucide-react";
import Header from "../components/Header";
import UploadModal from "../components/UploadModal";
import { ROUTES, STORAGE_KEYS } from "../lib/constants";

/**
 * Interfaces and Types
 */
interface SearchHistoryItemDisplay {
  id: string;
  query: string;
  timestamp: Date;
}

interface Topic {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface QuickActionProps {
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
  title: string;
  description: string;
  onClick: () => void;
}

interface TopicButtonProps {
  topic: Topic;
  onClick: (topicId: string) => void;
}

/**
 * Constants
 */
const suggestedTopics: Topic[] = [
  { id: "aapl", label: "AAPL", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "crypto", label: "Crypto", icon: <Bitcoin className="w-4 h-4" /> },
  {
    id: "green-energy",
    label: "Green Energy",
    icon: <Leaf className="w-4 h-4" />,
  },
  {
    id: "interest-rates",
    label: "Interest Rates",
    icon: <DollarSign className="w-4 h-4" />,
  },
];

// Trending topics for logged-out users
const trendingTopics: Topic[] = [
  { id: "nifty50", label: "Nifty 50", icon: <BarChart className="w-4 h-4" />, count: 1245 },
  { id: "ai-stocks", label: "AI Stocks", icon: <Activity className="w-4 h-4" />, count: 987 },
  { id: "renewable", label: "Renewable Energy", icon: <Leaf className="w-4 h-4" />, count: 856 },
  { id: "banking", label: "Banking Sector", icon: <DollarSign className="w-4 h-4" />, count: 742 },
  { id: "tech-stocks", label: "Tech Stocks", icon: <TrendingUp className="w-4 h-4" />, count: 635 },
];

// Initial empty array for recent searches
const initialRecentSearches: SearchHistoryItemDisplay[] = [];

/**
 * Component for a single topic button
 */
const TopicButton: React.FC<TopicButtonProps> = ({ topic, onClick }) => (
  <motion.button
    key={topic.id}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2"
    onClick={() => onClick(topic.id)}
  >
    <span className="text-indigo-600">{topic.icon}</span>
    <span className="text-gray-700">{topic.label}</span>
    {topic.count !== undefined && (
      <span className="text-xs text-gray-500 ml-1">{topic.count}+</span>
    )}
  </motion.button>
);

/**
 * Component for a quick action button
 */
const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  bgColor,
  iconColor,
  title,
  description,
  onClick
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left group"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className={`${bgColor} rounded-lg p-3`}>
          <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" />
    </div>
  </motion.button>
);



/**
 * Main Dashboard component
 */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItemDisplay[]>(initialRecentSearches);
  const [isLoadingSearches, setIsLoadingSearches] = useState(false);

  /**
   * Fetch recent searches on component mount if user is logged in
   */
  useEffect(() => {
    document.title = "Dashboard - SmartInvest Scout";
    
    // Only fetch recent searches if user is logged in
    if (user) {
      const fetchRecentSearches = async () => {
        setIsLoadingSearches(true);
        try {
          const searches = await getRecentSearches(5, user.id);
          // Convert timestamp strings to Date objects for display
          const formattedSearches = searches.map(search => ({
            id: search.id,
            query: search.query,
            timestamp: new Date(search.timestamp)
          }));
          setRecentSearches(formattedSearches);
        } catch (error) {
          console.error('Error fetching recent searches:', error);
        } finally {
          setIsLoadingSearches(false);
        }
      };
      
      fetchRecentSearches();
    } else {
      // For logged-out users, we don't need to fetch anything
      setIsLoadingSearches(false);
    }
  }, [user]);

  /**
   * Event Handlers
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Extract just the symbol if it's in the format "SYMBOL - Company Name"
    const query = suggestion.includes(' - ') ? suggestion.split(' - ')[0] : suggestion;
    // Save search query to history only if user is logged in
    if (user) {
      saveSearchQuery(query, user.id);
    }
    navigate(ROUTES.SEARCH_WITH_QUERY(query));
  };

  const handleTopicClick = (topicId: string) => {
    if (user) {
      saveSearchQuery(topicId, user.id);
    }
    navigate(ROUTES.SEARCH_WITH_QUERY(topicId));
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadComplete = (summary: DocumentSummary) => {
    // Store the summary in session storage to pass to the Summary page
    sessionStorage.setItem(STORAGE_KEYS.DOCUMENT_SUMMARY, JSON.stringify(summary));
    navigate(ROUTES.SUMMARY);
  };

  return (
    <>
      <div>
        <Header />
      </div>
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                <SearchSuggestions
                onSuggestionClick={handleSuggestionClick}
                placeholder="Search stocks, companies, or investment topics..."
                minQueryLength={2}
                debounceDelay={300}
              />
              </form>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickAction 
                icon={<MessageSquare />}
                bgColor="bg-indigo-100"
                iconColor="text-indigo-600"
                title="Ask Anything"
                description="Get instant answers to your investment questions"
                onClick={() => navigate(ROUTES.CHAT)}
              />
              
              <QuickAction 
                icon={<Upload />}
                bgColor="bg-purple-100"
                iconColor="text-purple-600"
                title="Upload Document"
                description="Analyze earnings reports and financial documents"
                onClick={handleUploadClick}
              />
            </div>

            {/* Suggested Topics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Suggested Topics
              </h2>
              <div className="flex flex-wrap gap-3">
                {suggestedTopics.map((topic) => (
                  <TopicButton 
                    key={topic.id}
                    topic={topic}
                    onClick={handleTopicClick}
                  />
                ))}
              </div>
            </div>

            {/* Trending Topics - Only visible to authenticated users */}
            {user && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Trending Topics
                </h2>
                <div className="flex flex-wrap gap-3">
                  {trendingTopics.map((topic) => (
                    <TopicButton 
                      key={topic.id}
                      topic={topic}
                      onClick={handleTopicClick}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches or Trending Topics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user ? "Recent Searches" : "Recent Trending"}
                </h2>
                {user ? (
                  <Clock className="h-5 w-5 text-gray-400" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div className="space-y-3">
                {user ? (
                  // Show recent searches for logged-in users
                  isLoadingSearches ? (
                    <div className="text-center py-4 text-gray-500">Loading recent searches...</div>
                  ) : recentSearches.length > 0 ? (
                    recentSearches.map((search) => (
                      <motion.button
                        key={search.id}
                        whileHover={{ scale: 1.01 }}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors duration-200"
                        onClick={() => {
                          if (user) {
                            saveSearchQuery(search.query, user.id);
                          }
                          navigate(ROUTES.SEARCH_WITH_QUERY(search.query));
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 rounded-full p-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                          </div>
                          <span className="text-gray-700">{search.query}</span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {search.timestamp.toLocaleDateString()}
                        </span>
                      </motion.button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No recent searches found. Try searching for something!
                    </div>
                  )
                ) : (
                  // Show trending topics for logged-out users
                  trendingTopics.map((topic) => (
                    <motion.button
                      key={topic.id}
                      whileHover={{ scale: 1.01 }}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors duration-200"
                      onClick={() => {
                        navigate(ROUTES.SEARCH_WITH_QUERY(topic.label));
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-indigo-50 rounded-full p-2">
                          {topic.icon}
                        </div>
                        <span className="text-gray-700">{topic.label}</span>
                      </div>
                      {topic.count !== undefined && (
                        <div className="flex items-center text-sm text-gray-400">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span>{topic.count.toLocaleString()}</span>
                        </div>
                      )}
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
};

export default Dashboard;
