import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  TrendingUp,
  AlertCircle,
  FileText,
  Briefcase,
  BarChart,
  Globe,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getUserAlerts, markAlertsAsRead } from "../lib/api/alerts";
import { UserAlert } from "../lib/types/alerts";
import { useAuth } from "../contexts/AuthContext";

interface AlertFeedProps {
  limit?: number;
  showHeader?: boolean;
  className?: string;
  filterCategory?: string;
}

const AlertFeed: React.FC<AlertFeedProps> = ({
  limit = 5,
  showHeader = true,
  className = "",
  filterCategory,
}) => {
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [truncatedAlerts, setTruncatedAlerts] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchAlerts();
    }
  }, [user, filterCategory, limit]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const fetchedAlerts = await getUserAlerts(user?.id || "", limit);
      setAlerts(fetchedAlerts);
      setError(null);
    } catch (err) {
      setError("Failed to load alerts. Please try again later.");
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      if (!user?.id || !alertId) return;

      await markAlertsAsRead(user.id, [alertId]);

      // Update local state
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      );
    } catch (err) {
      console.error("Error marking alert as read:", err);
    }
  };

  const toggleExpandAlert = (alertId: string) => {
    setExpandedAlerts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Earnings":
        return <BarChart className="h-5 w-5 text-green-500" />;
      case "Strategy":
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case "Regulatory":
        return <FileText className="h-5 w-5 text-purple-500" />;
      case "Product":
        return <TrendingUp className="h-5 w-5 text-indigo-500" />;
      case "Analyst":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "Macro":
        return <Globe className="h-5 w-5 text-cyan-500" />;
      case "Sentiment":
        return <MessageCircle className="h-5 w-5 text-pink-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Earnings":
        return "bg-green-100 text-green-800";
      case "Strategy":
        return "bg-blue-100 text-blue-800";
      case "Regulatory":
        return "bg-purple-100 text-purple-800";
      case "Product":
        return "bg-indigo-100 text-indigo-800";
      case "Analyst":
        return "bg-yellow-100 text-yellow-800";
      case "Macro":
        return "bg-cyan-100 text-cyan-800";
      case "Sentiment":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="flex items-center justify-center h-40">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10 transition-colors duration-300"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors duration-300"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded transition-colors duration-300"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 transition-colors duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className} transition-colors duration-300`}>
        <div className="flex items-center justify-center h-40 text-red-500 dark:text-red-400 transition-colors duration-300">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Filter alerts based on category if filterCategory is provided
  const filteredAlerts = filterCategory
    ? alerts.filter((alert) => alert.category === filterCategory)
    : alerts;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${className} transition-colors duration-300`}>
      {showHeader && (
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center transition-colors duration-300">
              <Bell className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 transition-colors duration-300" />
              Market Alerts
              {filterCategory && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  Filtered by: {filterCategory}
                </span>
              )}
            </h2>
            {alerts.length > 0 && (
              <button
                onClick={() => fetchAlerts()}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-300"
              >
                Refresh
              </button>
            )}
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500 transition-colors duration-300" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    {alerts.length > 0 && filterCategory
                      ? `No ${filterCategory} Alerts`
                      : "No New Notifications"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto transition-colors duration-300">
                    {alerts.length > 0 && filterCategory
                      ? `We haven't found any alerts in the ${filterCategory} category. Try selecting a different category or check back later.`
                      : "You're all caught up! We'll notify you here when there are important market events related to your tracked companies and sectors."}
                  </p>
                </div>
                {alerts.length > 0 && filterCategory && (
                  <button
                    onClick={() => fetchAlerts()}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
                  >
                    View All Alerts
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            filteredAlerts.map((alert) => {
              const isExpanded = expandedAlerts.has(alert.id || "");
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 ${!alert.isRead ? "bg-indigo-50 dark:bg-indigo-900/20" : "dark:bg-gray-800"} transition-colors duration-300`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getCategoryIcon(alert.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate transition-colors duration-300">
                          {alert.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(alert.timestamp), {
                              addSuffix: true,
                            })}
                          </span>
                          {!alert.isRead && (
                            <span className="inline-block h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 transition-colors duration-300"></span>
                          )}
                        </div>
                      </div>
                      <div className="mt-1">
                        <p
                          ref={(el) => {
                            // Check if text is truncated and update state accordingly
                            if (el && !isExpanded) {
                              const isTruncated = el.scrollHeight > el.clientHeight;
                              if (isTruncated && !truncatedAlerts.has(alert.id || "")) {
                                setTruncatedAlerts(prev => {
                                  const newSet = new Set(prev);
                                  newSet.add(alert.id || "");
                                  return newSet;
                                });
                              } else if (!isTruncated && truncatedAlerts.has(alert.id || "")) {
                                setTruncatedAlerts(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(alert.id || "");
                                  return newSet;
                                });
                              }
                            }
                          }}
                          className={`text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300 ${
                            isExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          {alert.description}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                              alert.category
                            )}`}
                          >
                            {alert.category}
                          </span>
                          {alert.relatedTo && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              {Array.isArray(alert.relatedTo) ? (
                                <>
                                  {alert.relatedTo.slice(0, 2).join(", ")}
                                  {alert.relatedTo.length > 2 && "..."}
                                </>
                              ) : typeof alert.relatedTo === "string" ? (
                                <>
                                  {(() => {
                                    try {
                                      const parsed = JSON.parse(
                                        alert.relatedTo
                                      );
                                      return Array.isArray(parsed) ? (
                                        <>
                                          {parsed.slice(0, 2).join(", ")}
                                          {parsed.length > 2 && "..."}
                                        </>
                                      ) : (
                                        String(alert.relatedTo).slice(0, 30)
                                      );
                                    } catch {
                                      return String(alert.relatedTo).slice(
                                        0,
                                        30
                                      );
                                    }
                                  })()}
                                </>
                              ) : null}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {(isExpanded || truncatedAlerts.has(alert.id || "")) && (
                            <button
                              onClick={() => toggleExpandAlert(alert.id || "")}
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center transition-colors duration-300"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  More
                                </>
                              )}
                            </button>
                          )}
                          {!alert.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(alert.id || "")}
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center transition-colors duration-300"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {alerts.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => {
              /* Navigate to alerts page */
            }}
            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View all alerts
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertFeed;
