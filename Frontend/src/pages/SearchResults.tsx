import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../hooks/useToast";
import {
  ArrowLeft,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Newspaper,
} from "lucide-react";
import Button from "../components/Button";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

interface MarketSummary {
  whats_happening: string;
  key_drivers: string;
  market_reaction: string;
}

interface RiskFactors {
  regulatory: string;
  competition: string;
  product_delays: string;
}

interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
}

interface InsightsData {
  company: string;
  last_updated: string;
  market_summary: MarketSummary;
  risk_factors: RiskFactors;
  latest_news: NewsItem[];
  follow_up_questions: string[];
}

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const { query } = useParams<{ query: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = `${query} - SmartInvest Scout`;
    fetchInsights();
  }, [query]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/insights/${query}`);
      setInsights(response.data as InsightsData);
    } catch (err) {
      setError("Failed to fetch insights. Please try again later.");
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpQuestion = (question: string) => {
    if (user) {
      navigate("/chat", {
        state: {
          initialQuestion: question,
          context: insights,
        },
      });
    } else {
      showToast({
        title: "Login Required",
        message: "Please log in to ask questions about this company",
        type: "info",
        duration: 1500,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button label="Try Again" primary onClick={fetchInsights} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Dashboard</span>
          </button>
          <Button
            label="Ask About This"
            icon="external-link"
            primary
            onClick={() => {
              if (user) {
                // Navigate to chat page with context and initial question
                // Format a more specific question based on the insights
                const specificQuestion = insights?.market_summary?.key_drivers
                  ? `Tell me more about ${insights?.company} and how ${insights?.market_summary?.key_drivers} is affecting its performance`
                  : `Tell me more about ${insights?.company}`;

                navigate("/chat", {
                  state: {
                    initialQuestion: specificQuestion,
                    context: insights,
                  },
                });
              } else {
                showToast({
                  title: "Login Required",
                  message: "Please log in to ask questions about this company",
                  type: "info",
                  duration: 1500,
                });
              }
            }}
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
            Showing insights for: {insights?.company}
          </h1>
          <p className="text-gray-600">
            Last updated:{" "}
            {new Date(insights?.last_updated || "").toLocaleString()}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Summary Card */}
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Market Summary
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    What's Happening
                  </h3>
                  <p className="text-gray-600">
                    {insights?.market_summary?.whats_happening ||
                      "No data available"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Key Drivers
                  </h3>
                  <p className="text-gray-600">
                    {insights?.market_summary?.key_drivers ||
                      "No data available"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Market Reaction
                  </h3>
                  <p className="text-gray-600">
                    {insights?.market_summary?.market_reaction ||
                      "No data available"}
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Latest News
                </h2>
              </div>
              <div className="space-y-4">
                {insights?.latest_news?.length ? (
                  insights.latest_news.map((news, i) => (
                    <div
                      key={i}
                      className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                    >
                      <h3 className="font-medium text-gray-900 mb-1">
                        {news.headline}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {news.summary}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{news.source}</span>
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-indigo-600 hover:text-indigo-800"
                        >
                          Read more →
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No news available</p>
                )}
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Risk Factors
                </h2>
              </div>
              <div className="space-y-3">
                {insights?.risk_factors ? (
                  Object.entries(insights.risk_factors).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start space-x-3 justify-between"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {key.charAt(0).toUpperCase() +
                            key.slice(1).replace(/_/g, " ")}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {value || "No details available"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No risk factors available</p>
                )}
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
                <h2 className="text-xl font-semibold text-gray-900">
                  Ask Follow-up
                </h2>
              </div>
              <div className="space-y-3">
                {insights?.follow_up_questions?.length ? (
                  insights.follow_up_questions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => handleFollowUpQuestion(question)}
                      className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors duration-200"
                    >
                      {question}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-600">
                    No follow-up questions available
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
