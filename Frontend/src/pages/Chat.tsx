import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Send, Bot, User, Loader2, Info, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { getPersonalizedChatResponse } from "../lib/api";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  personalizationContext?: {
    riskAppetite: string;
    investmentGoals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
}

const suggestedPrompts = [
  "What's driving Apple's Q2 rally?",
  "Is Microsoft's cloud growth sustainable?",
  "Explain the impact of rising interest rates on tech stocks",
  "What are the key risks for Tesla in 2024?",
];

const Chat: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showContextInfo, setShowContextInfo] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    document.title = "Ask Anything - SmartInvest Scout";
  }, []);

  // Check if user is logged in but has no profile
  useEffect(() => {
    setShowProfilePrompt(!!user && !profile);
  }, [user, profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      if (user) {
        // Get personalized response from backend
        const response = await getPersonalizedChatResponse(user.id, input.trim());
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: response.content,
          timestamp: new Date(),
          personalizationContext: response.personalizationContext
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // Fallback for non-logged in users
        setTimeout(() => {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: "For personalized investment insights tailored to your risk profile and interests, please sign in and set up your profile.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        }, 1500);
      }
    } catch (error) {
      console.error("Error getting chat response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleContextInfo = (index: number) => {
    if (showContextInfo === index) {
      setShowContextInfo(null);
    } else {
      setShowContextInfo(index);
    }
  };

  const formatContextItem = (item: string) => {
    return item.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const MessageBubble: React.FC<{ message: Message; index: number }> = ({ message, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start space-x-3 ${
        message.type === "ai" ? "bg-white" : "bg-indigo-50"
      } rounded-lg p-4 mb-4`}
    >
      <div
        className={`p-2 rounded-lg ${
          message.type === "ai" ? "bg-indigo-100" : "bg-indigo-200"
        }`}
      >
        {message.type === "ai" ? (
          <Bot className="h-5 w-5 text-indigo-600" />
        ) : (
          <User className="h-5 w-5 text-indigo-700" />
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <span className="font-medium text-gray-900">
              {message.type === "ai" ? "SmartInvest Scout" : "You"}
            </span>
            {message.type === "ai" && message.personalizationContext && (
              <button 
                onClick={() => toggleContextInfo(index)}
                className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <Info className="h-3 w-3 mr-1" />
                <span>Personalized for you</span>
              </button>
            )}
          </div>
          <span className="text-sm text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        {showContextInfo === index && message.personalizationContext && (
          <div className="mb-3 p-2 bg-indigo-50 rounded-md text-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-indigo-800">Answer based on your profile:</span>
              <button 
                onClick={() => setShowContextInfo(null)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="text-indigo-700 text-xs space-y-1">
              <li>Risk appetite: <span className="font-medium capitalize">{message.personalizationContext.riskAppetite}</span></li>
              {message.personalizationContext.investmentGoals.length > 0 && (
                <li>Goals: <span className="font-medium">{message.personalizationContext.investmentGoals.map(formatContextItem).join(', ')}</span></li>
              )}
              {message.personalizationContext.watchlist.length > 0 && (
                <li>Watchlist: <span className="font-medium">{message.personalizationContext.watchlist.join(', ')}</span></li>
              )}
              {message.personalizationContext.holdings.length > 0 && (
                <li>Holdings: <span className="font-medium">{message.personalizationContext.holdings.join(', ')}</span></li>
              )}
            </ul>
          </div>
        )}
        
        <p className="text-gray-700">{message.content}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search previous chats..."
                className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {showProfilePrompt && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-indigo-800 mb-2">Get personalized investment advice</h3>
              <p className="text-indigo-700 mb-4 text-sm">
                Create your investment profile to get responses tailored to your risk appetite, goals, and interests.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Set up profile
              </button>
            </div>
          )}
          
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Ask me anything about investments
              </h2>
              <p className="text-gray-600 mb-8">
                Get instant, AI-powered insights about stocks, market trends,
                and investment strategies
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="text-left p-4 rounded-lg bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble key={message.id} message={message} index={index} />
              ))}
              {isTyping && (
                <div className="flex items-center space-x-2 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>SmartInvest Scout is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your investment question..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2
                ${
                  input.trim() && !isTyping
                    ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              <span>Send</span>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
