import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  ArrowLeft,
  Send,
  Bot,
  User,
  Loader2,
  Info,
  X,
  MessageSquare,
  Plus,
} from "lucide-react";
import ConversationSidebar from "../components/ConversationSidebar";
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";
import { getPersonalizedChatResponse } from "../lib/api";
import { createConversation, addMessageToConversation, getActiveConversation } from "../lib/api/conversations";
import { Conversation, ConversationMessage } from "../lib/api/types";
import ReactMarkdown from "react-markdown";

// Message type definition
interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  personalizationContext?: {
    riskAppetite: string;
    investmentGoals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
}

// Suggested prompts for empty chat
const suggestedPrompts = [
  "What stocks should I consider for a long-term investment?",
  "How do I build a diversified portfolio?",
  "Explain the difference between growth and value investing",
  "What are the best ETFs for passive income?",
];

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showContextInfo, setShowContextInfo] = useState<number | null>(null);
  const [showConversationSidebar, setShowConversationSidebar] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set page title
  useEffect(() => {
    document.title = "Ask Anything - SmartInvest Scout";
  }, []);

  // Check if user is logged in but has no profile
  useEffect(() => {
    setShowProfilePrompt(!!user && !profile);
  }, [user, profile]);

  // Use a ref to track if we've already loaded the active conversation
  const hasLoadedActiveConversation = useRef(false);

  // Load active conversation on mount, but only if we're not coming from "Ask about this"
  useEffect(() => {
    // Skip if we've already loaded the conversation or if we're coming from "Ask about this"
    if (hasLoadedActiveConversation.current || (location.state?.initialQuestion && location.state?.context)) {
      return;
    }
    
    const loadActiveConversation = async () => {
      if (user) {
        try {
          const conversation = await getActiveConversation(user.id);
          if (conversation) {
            setActiveConversation(conversation);
            
            // Format messages from conversation
            const formattedMessages: Message[] = conversation.messages.map((msg: ConversationMessage) => ({
              id: uuidv4(), // Generate a new ID since ConversationMessage doesn't have one
              type: msg.role === "user" ? "user" : "ai",
              content: msg.content,
              timestamp: new Date(msg.timestamp || new Date()),
              personalizationContext: msg.personalization_context || null
            }));
            
            setMessages(formattedMessages);
            
            // Mark that we've loaded the active conversation
            hasLoadedActiveConversation.current = true;
          }
        } catch (error) {
          console.error("Error loading active conversation:", error);
        }
      }
    };

    loadActiveConversation();
  }, [user, location.state]);



  // Handle initial question with context from SearchResults page
  useEffect(() => {
    // Check if we have an initial question and context from location state
    if (location.state?.initialQuestion && location.state?.context) {
      const { initialQuestion, context } = location.state;
      
      const handleInitialNavigation = async () => {
        // Always start a new chat when coming from "Ask about this"
        // Clear any existing conversation and messages
        setActiveConversation(null);
        setMessages([]);
        
        // Add a system message indicating we're continuing from insights
        const systemMessage: Message = {
          id: uuidv4(),
          type: "system",
          content: `You're now chatting about ${context.company}. I have information about its recent performance and market trends.`,
          timestamp: new Date(),
        };
        
        // Add the user's question to the chat
        const userMessage: Message = {
          id: uuidv4(),
          type: "user",
          content: initialQuestion,
          timestamp: new Date(),
        };
        
        setMessages([systemMessage, userMessage]);
        
        // Always create a new conversation for "Ask about this"
        handleInitialQuestion(initialQuestion, context);
      };
      
      handleInitialNavigation();
      
      // Clear location state to prevent duplicate handling on re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, user]);

  // Handle initial question with context
  const handleInitialQuestion = async (question: string, context: any, conversationId?: string) => {
    if (!user) return;
    
    setIsTyping(true);
    
    try {
      // Format context into a structured string
      const contextString = 
        `Context about ${context.company}:\n` +
        `Company: ${context.company}\n` +
        `Market Summary: ${context.market_summary.summary}\n` +
        `Key Drivers: ${context.market_summary.key_drivers}\n` +
        `Market Reaction: ${context.market_summary.market_reaction}`;
      
      // Get personalized response from backend
      // The backend will extract the context and question
      const questionWithContext = `${contextString}\n\nQuestion: ${question}`;
      const response = await getPersonalizedChatResponse(
        user.id,
        questionWithContext,
        conversationId // Use existing conversation ID if provided
      );

      const aiMessage: Message = {
        id: uuidv4(),
        type: "ai",
        content: response.content,
        timestamp: new Date(),
        personalizationContext: response.personalizationContext,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Create or update conversation with context
      try {
        // Store the context in the personalization context object
        const personalizationContextWithData = {
          ...response.personalizationContext,
          insightsContext: contextString
        };
        
        if (conversationId) {
          // Add to existing conversation
          await addMessageToConversation(
            conversationId,
            question,
            response.content,
            personalizationContextWithData
          );
          // We don't need to update activeConversation as it's already set
        } else {
          // Create a new conversation
          const newConversation = await createConversation(
            user.id,
            question,
            response.content,
            personalizationContextWithData
          );
          setActiveConversation(newConversation);
        }
      } catch (saveError) {
        console.error("Error saving conversation:", saveError);
      }
    } catch (error) {
      console.error("Error getting response:", error);
      setIsTyping(false);
      
      // Show error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: "system",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isTyping || !user) return;
    
    const question = input.trim();
    setInput("");
    
    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Get personalized response from backend
      const response = await getPersonalizedChatResponse(
        user.id,
        question,
        activeConversation?.id
      );

      const aiMessage: Message = {
        id: uuidv4(),
        type: "ai",
        content: response.content,
        timestamp: new Date(),
        personalizationContext: response.personalizationContext,
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // Save the message to the conversation
      try {
        if (activeConversation) {
          // Add to existing conversation
          await addMessageToConversation(
            activeConversation.id,
            question,
            response.content,
            response.personalizationContext
          );
        } else {
          // Create a new conversation
          const newConversation = await createConversation(
            user.id,
            question,
            response.content,
            response.personalizationContext
          );
          setActiveConversation(newConversation);
        }
      } catch (saveError) {
        console.error("Error saving conversation:", saveError);
      }
    } catch (error) {
      console.error("Error getting response:", error);
      setIsTyping(false);
      
      // Show error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: "system",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Start a new chat
  const handleNewChat = () => {
    setActiveConversation(null);
    setMessages([]);
    // Close the sidebar if it's open
    if (showConversationSidebar) {
      setShowConversationSidebar(false);
    }
  };

  // Format context item for display
  const formatContextItem = (item: string) => {
    return item.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Toggle context info display
  const toggleContextInfo = (index: number) => {
    if (showContextInfo === index) {
      setShowContextInfo(null);
    } else {
      setShowContextInfo(index);
    }
  };

  // Message bubble component
  const MessageBubble: React.FC<{ message: Message; index: number }> = ({
    message,
    index,
  }) => {
    // Special handling for system messages
    if (message.type === "system") {
      return (
        <div className="flex justify-center mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 max-w-[90%] flex items-start">
            <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-blue-700 text-sm">{message.content}</div>
          </div>
        </div>
      );
    }
    
    // Regular user and AI messages
    return (
      <div
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
                <span className="font-medium text-indigo-800">
                  Answer based on your profile:
                </span>
                <button
                  onClick={() => setShowContextInfo(null)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ul className="text-indigo-700 text-xs space-y-1">
                <li>
                  Risk appetite:{" "}
                  <span className="font-medium capitalize">
                    {message.personalizationContext.riskAppetite}
                  </span>
                </li>
                {message.personalizationContext.investmentGoals.length > 0 && (
                  <li>
                    Goals:{" "}
                    <span className="font-medium">
                      {message.personalizationContext.investmentGoals
                        .map(formatContextItem)
                        .join(", ")}
                    </span>
                  </li>
                )}
                {message.personalizationContext.watchlist.length > 0 && (
                  <li>
                    Watchlist:{" "}
                    <span className="font-medium">
                      {message.personalizationContext.watchlist.join(", ")}
                    </span>
                  </li>
                )}
                {message.personalizationContext.holdings.length > 0 && (
                  <li>
                    Holdings:{" "}
                    <span className="font-medium">
                      {message.personalizationContext.holdings.join(", ")}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="prose prose-indigo text-gray-700">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

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
            <button
              onClick={() => setShowConversationSidebar(true)}
              className="flex items-center px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg transition-colors duration-200"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversations
            </button>
            {activeConversation && (
              <button
                onClick={handleNewChat}
                className="flex items-center px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {showProfilePrompt && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-indigo-800 mb-2">
                Get personalized investment advice
              </h3>
              <p className="text-indigo-700 mb-4 text-sm">
                Create your investment profile to get responses tailored to your
                risk appetite, goals, and interests.
              </p>
              <button
                onClick={() => navigate("/profile")}
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
                <MessageBubble
                  key={message.id}
                  message={message}
                  index={index}
                />
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
                  !input.trim() || isTyping
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
              <Send className="h-5 w-5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Conversation Sidebar */}
      <ConversationSidebar
        userId={user?.id || ""}
        isOpen={showConversationSidebar}
        onClose={() => setShowConversationSidebar(false)}
        onSelectConversation={(conversation) => {
          try {
            // Only load the conversation if it's different from the current one
            if (activeConversation?.id !== conversation.id) {
              // Clear messages first to prevent duplicates
              setMessages([]);
              
              // Ensure conversation has messages before trying to map them
              if (conversation.messages && Array.isArray(conversation.messages)) {
                // Format messages from the selected conversation
                const formattedMessages: Message[] = conversation.messages.map((msg) => ({
                  id: uuidv4(),
                  type: msg.role === "user" ? "user" : "ai",
                  content: msg.content || "",
                  timestamp: new Date(msg.timestamp || new Date()),
                  personalizationContext: msg.personalization_context || null
                }));
                
                // Set the active conversation and messages
                setActiveConversation(conversation);
                setMessages(formattedMessages);
              } else {
                console.error("Selected conversation has no messages or invalid message format");
                // Set active conversation but with empty messages
                setActiveConversation(conversation);
              }
            }
          } catch (error) {
            console.error("Error selecting conversation:", error);
          }
          setShowConversationSidebar(false);
        }}
        onNewChat={handleNewChat}
        activeConversationId={activeConversation?.id}
      />
    </div>
  );
};

export default Chat;
