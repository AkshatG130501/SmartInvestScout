import React, { useState, useEffect } from "react";
import { DocumentSummary } from "../lib/api";
import { saveSearchQuery, getRecentSearches } from "../lib/api/search";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SearchSuggestions from "../components/SearchSuggestions";
import {
  MessageSquare,
  Upload,
  TrendingUp,
  Bitcoin,
  Leaf,
  DollarSign,
  Clock,
  ChevronRight,
} from "lucide-react";
import Header from "../components/Header";
import UploadModal from "../components/UploadModal";

interface SearchHistoryItemDisplay {
  id: string;
  query: string;
  timestamp: Date;
}

const suggestedTopics = [
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

// Initial empty array for recent searches
const initialRecentSearches: SearchHistoryItemDisplay[] = [];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchHistoryItemDisplay[]>(initialRecentSearches);
  const [isLoadingSearches, setIsLoadingSearches] = useState(false);

  useEffect(() => {
    document.title = "Dashboard - SmartInvest Scout";
    
    // Fetch recent searches when component mounts
    const fetchRecentSearches = async () => {
      setIsLoadingSearches(true);
      try {
        const searches = await getRecentSearches(5);
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
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Extract just the symbol if it's in the format "SYMBOL - Company Name"
    const query = suggestion.includes(' - ') ? suggestion.split(' - ')[0] : suggestion;
    // Save search query to history
    saveSearchQuery(query);
    navigate(`/search/${encodeURIComponent(query)}`);
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleUploadComplete = (summary: DocumentSummary) => {
    // Store the summary in session storage to pass to the Summary page
    sessionStorage.setItem("documentSummary", JSON.stringify(summary));
    navigate("/summary");
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
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left group"
                onClick={() => navigate("/chat")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-indigo-100 rounded-lg p-3">
                      <MessageSquare className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Ask Anything
                      </h3>
                      <p className="text-sm text-gray-500">
                        Get instant answers to your investment questions
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" />
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-left group"
                onClick={handleUploadClick}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Upload className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Upload Document
                      </h3>
                      <p className="text-sm text-gray-500">
                        Analyze earnings reports and financial documents
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
                </div>
              </motion.button>
            </div>

            {/* Suggested Topics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Suggested Topics
              </h2>
              <div className="flex flex-wrap gap-3">
                {suggestedTopics.map((topic) => (
                  <motion.button
                    key={topic.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-lg transition-colors duration-200"
                    onClick={() =>
                      navigate(`/search/${encodeURIComponent(topic.label)}`)
                    }
                  >
                    {topic.icon}
                    <span>{topic.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Searches
                </h2>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {isLoadingSearches ? (
                  <div className="text-center py-4 text-gray-500">Loading recent searches...</div>
                ) : recentSearches.length > 0 ? (
                  recentSearches.map((search) => (
                    <motion.button
                      key={search.id}
                      whileHover={{ scale: 1.01 }}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors duration-200"
                      onClick={() => {
                        saveSearchQuery(search.query);
                        navigate(`/search/${encodeURIComponent(search.query)}`);
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
