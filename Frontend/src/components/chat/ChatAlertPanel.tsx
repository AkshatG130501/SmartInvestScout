/**
 * @file ChatAlertPanel component
 * @description Component for displaying relevant alerts in the chat interface
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  BarChart,
  Briefcase,
  FileText,
  TrendingUp,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getUserAlerts, markAlertsAsRead } from "../../lib/api/alerts";
import { UserAlert } from "../../lib/types/alerts";

interface ChatAlertPanelProps {
  userId: string;
  relatedTopics?: string[];
  onAskAboutAlert: (alert: UserAlert) => void;
  className?: string;
}

const ChatAlertPanel: React.FC<ChatAlertPanelProps> = ({
  userId,
  relatedTopics = [],
  onAskAboutAlert,
  className = "",
}) => {
  const [alerts, setAlerts] = useState<UserAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [askedAlerts, setAskedAlerts] = useState<Set<string>>(new Set());
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  // Fetch alerts when component mounts or userId/relatedTopics change
  useEffect(() => {
    if (userId) {
      fetchAlerts();
    }
  }, [userId, relatedTopics]);
  
  // Keep the panel expanded if there are asked alerts
  useEffect(() => {
    if (askedAlerts.size > 0) {
      setIsExpanded(true);
    }
  }, [askedAlerts]);

  // Fetch alerts from API
  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Fetch more alerts than we'll display to ensure we have enough relevant ones
      const fetchedAlerts = await getUserAlerts(userId, 20);
      
      // Filter alerts by relevance to current chat topics if relatedTopics are provided
      let filteredAlerts = fetchedAlerts;
      if (relatedTopics.length > 0) {
        filteredAlerts = fetchedAlerts.filter(alert => 
          alert.relatedTo.some(topic => 
            relatedTopics.some(relatedTopic => 
              topic.toLowerCase().includes(relatedTopic.toLowerCase())
            )
          )
        );
      }
      
      // Show at most 5 alerts, prioritizing unread ones
      const unreadAlerts = filteredAlerts.filter(alert => !alert.isRead);
      const readAlerts = filteredAlerts.filter(alert => alert.isRead);
      
      setAlerts([...unreadAlerts, ...readAlerts].slice(0, 5));
      setError(null);
    } catch (err) {
      setError("Failed to load alerts");
      console.error("Error fetching alerts for chat:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark an alert as read
  const handleMarkAsRead = async (alertId: string) => {
    try {
      if (!userId || !alertId) return;

      await markAlertsAsRead(userId, [alertId]);

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

  // Toggle expanded state of an individual alert
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

  // Handle asking about an alert
  const handleAskAbout = (alert: UserAlert) => {
    // Mark as read when asking about it
    if (alert.id && !alert.isRead) {
      handleMarkAsRead(alert.id);
    }
    
    // Ensure the alert has all required properties before passing it to the callback
    const safeAlert: UserAlert = {
      ...alert,
      // Ensure relatedTo is always an array
      relatedTo: Array.isArray(alert.relatedTo) ? alert.relatedTo : 
                (typeof alert.relatedTo === 'string' ? 
                  (alert.relatedTo ? [alert.relatedTo] : []) : [])
    };
    
    // Update the local state to mark this alert as read immediately
    setAlerts(prevAlerts => 
      prevAlerts.map(a => 
        a.id === alert.id ? { ...a, isRead: true } : a
      )
    );
    
    // Keep track of which alerts have been asked about
    if (alert.id) {
      setAskedAlerts(prev => {
        const newSet = new Set(prev);
        newSet.add(alert.id || '');
        return newSet;
      });
    }
    
    // Ensure the panel stays expanded
    setIsExpanded(true);
    
    // Call the callback with the sanitized alert
    onAskAboutAlert(safeAlert);
  };

  // If there are no alerts or an error occurred, don't render anything
  if ((alerts.length === 0 && !loading) || error) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md mb-4 overflow-hidden transition-colors duration-300 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-3 transition-colors duration-300">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400 transition-colors duration-300" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
              Related Alerts {alerts.filter(a => !a.isRead).length > 0 && 
                <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 rounded-full transition-colors duration-300">
                  {alerts.filter(a => !a.isRead).length} new
                </span>
              }
            </h3>
          </div>
          {isExpanded ? 
            <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-colors duration-300" /> : 
            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-colors duration-300" />
          }
        </button>
      </div>

      {/* Alert List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="divide-y divide-gray-200 dark:divide-gray-700 transition-colors duration-300"
          >
            {loading ? (
              <div className="p-4 flex items-center justify-center">
                <div className="animate-pulse flex space-x-3">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-8 w-8 transition-colors duration-300"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors duration-300"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 transition-colors duration-300"></div>
                  </div>
                </div>
              </div>
            ) : (
              alerts.map((alert) => {
                const isExpanded = expandedAlerts.has(alert.id || "");
                return (
                  <div
                    key={alert.id}
                    className={`p-3 ${!alert.isRead ? "bg-indigo-50 dark:bg-indigo-900/20" : ""} transition-colors duration-300`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {/* Inline category icon based on alert category */}
                        {(() => {
                          switch (alert.category) {
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
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate transition-colors duration-300">
                            {alert.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
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
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${(() => {
                                switch (alert.category) {
                                  case "Earnings":
                                    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                                  case "Strategy":
                                    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
                                  case "Regulatory":
                                    return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
                                  case "Product":
                                    return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300";
                                  case "Analyst":
                                    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
                                  case "Macro":
                                    return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300";
                                  case "Sentiment":
                                    return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
                                  default:
                                    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
                                }
                              })()}`}
                            >
                              {alert.category}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
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
                          </div>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => handleAskAbout(alert)}
                            className="flex-1 flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors duration-300"
                          >
                            <MessageCircle className="h-3.5 w-3.5 mr-1" />
                            Ask about this
                          </button>
                          <button
                            onClick={() => {
                              /* Navigate to alerts page */
                              window.location.href = "/alerts";
                            }}
                            className="flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAlertPanel;
