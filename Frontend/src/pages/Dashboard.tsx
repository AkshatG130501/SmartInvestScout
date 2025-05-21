import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
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
import { useAuth } from "../contexts/AuthContext";

interface SearchHistoryItem {
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

const recentSearches: SearchHistoryItem[] = [
  {
    id: "1",
    query: "TSLA earnings forecast",
    timestamp: new Date("2024-03-10T10:30:00"),
  },
  {
    id: "2",
    query: "AI in Healthcare trends",
    timestamp: new Date("2024-03-09T15:45:00"),
  },
  {
    id: "3",
    query: "Bitcoin market analysis",
    timestamp: new Date("2024-03-08T09:20:00"),
  },
];

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Dashboard - SmartInvest Scout";
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleUploadClick = () => {
    if (!user) {
      console.log("User not authenticated");
    } else {
      navigate("/upload");
    }
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
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stocks, companies, or investment topics..."
                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
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
                {recentSearches.map((search) => (
                  <motion.button
                    key={search.id}
                    whileHover={{ scale: 1.01 }}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg group transition-colors duration-200"
                    onClick={() =>
                      navigate(`/search/${encodeURIComponent(search.query)}`)
                    }
                  >
                    <span className="text-gray-700 group-hover:text-indigo-600">
                      {search.query}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(search.timestamp)}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
