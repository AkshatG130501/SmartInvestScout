/**
 * @file Chat page component
 * @description Main chat interface with personalized AI responses
 */

import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// Components
import ConversationSidebar from "../components/ConversationSidebar";
import {
  MessageBubble,
  ProfilePrompt,
  ChatHeader,
  ChatInput,
  EmptyChatState,
  TypingIndicator,
} from "../components/chat/ChatComponents";

// Hooks and Contexts
import { useAuth } from "../contexts/AuthContext";
import { useProfile } from "../contexts/ProfileContext";

// API and Types
import { getPersonalizedChatResponse } from "../lib/api/chat";
import {
  createConversation,
  addMessageToConversation,
  getActiveConversation,
  deactivateUserConversations,
} from "../lib/api/conversations";
import {
  Conversation,
  ConversationMessage,
  ChatResponse,
} from "../lib/api/types";
import { Message } from "../types/chat";
import { ROUTES } from "../lib/constants";

/**
 * Constants
 */

// Suggested prompts for empty chat
const SUGGESTED_PROMPTS = [
  "What stocks should I consider for a long-term investment?",
  "How do I build a diversified portfolio?",
  "Explain the difference between growth and value investing",
  "What are the best ETFs for passive income?",
];

/**
 * Main Chat component
 */
const Chat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for messages, input, and UI
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showContextInfo, setShowContextInfo] = useState<number | null>(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showConversationSidebar, setShowConversationSidebar] = useState(false);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check if user is logged in but has no profile
  useEffect(() => {
    setShowProfilePrompt(!!user && !profile);
  }, [user, profile]);

  // Handle initial question with context from SearchResults page
  useEffect(() => {
    // Check if we have an initial question and context from location state
    if (location.state?.initialQuestion && location.state?.context) {
      const { initialQuestion, context } = location.state;

      const handleInitialQuestion = async () => {
        if (!user?.id) return;

        // Always start a new chat when coming from "Ask about this"
        setActiveConversation(null);
        setMessages([]);
        setIsTyping(true);

        // Explicitly deactivate any previous active conversations in the database
        try {
          await deactivateUserConversations(user.id);
        } catch (error) {
          console.error("Error deactivating previous conversations:", error);
          // Continue with the new conversation even if deactivation fails
        }

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

        try {
          // Format context into a structured string for the API
          const contextString =
            `Context about ${context.company}:\n` +
            `Company: ${context.company}\n` +
            `Market Summary: ${
              context.market_summary?.summary || "Not available"
            }\n` +
            `Key Drivers: ${
              context.market_summary?.key_drivers || "Not available"
            }\n` +
            `Market Reaction: ${
              context.market_summary?.market_reaction || "Not available"
            }`;

          // Get personalized response from backend with context
          const questionWithContext = `${contextString}\n\nQuestion: ${initialQuestion}`;
          const response = await getPersonalizedChatResponse(
            user.id,
            questionWithContext
          );

          // Create a new conversation with the context
          const newConversation = await createConversation(
            user.id,
            initialQuestion,
            response.content,
            response.personalizationContext ?? undefined
          );

          setActiveConversation(newConversation);

          // Add AI message to UI
          const aiMessage: Message = {
            id: uuidv4(),
            type: "ai",
            content: response.content,
            timestamp: new Date(),
            personalizationContext: response.personalizationContext,
          };

          setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
          console.error("Error processing initial question:", error);

          // Show error message
          const errorMessage: Message = {
            id: uuidv4(),
            type: "system",
            content:
              "Sorry, there was an error processing your request. Please try again.",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      };

      handleInitialQuestion();

      // Clear location state to prevent duplicate handling on re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, user]);

  // Toggle context info display
  const toggleContextInfo = (index: number) => {
    setShowContextInfo(showContextInfo === index ? null : index);
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Effect to check for profile and show prompt if needed
  useEffect(() => {
    if (user && !profile && messages.length === 0) {
      setShowProfilePrompt(true);
    }
  }, [user, profile, messages.length]);

  // Effect to load active conversation if any
  useEffect(() => {
    const loadActiveConversation = async () => {
      // Skip loading active conversation if we're handling an initial question from SearchResults
      // or if startNewChat flag is set
      if (
        (location.state?.initialQuestion && location.state?.context) ||
        location.state?.startNewChat
      ) {
        // If startNewChat flag is set, deactivate all previous conversations
        if (location.state?.startNewChat && user?.id) {
          try {
            await deactivateUserConversations(user.id);
            // Clear location state to prevent duplicate handling on re-renders
            navigate(location.pathname, { replace: true, state: {} });
          } catch (error) {
            console.error("Error deactivating previous conversations:", error);
          }
        }
        return; // Don't load active conversation
      }

      if (user?.id) {
        try {
          const conversation = await getActiveConversation(user.id);
          if (conversation) {
            setActiveConversation(conversation);

            // Format messages from conversation
            const formattedMessages: Message[] = conversation.messages.map(
              (msg: ConversationMessage) => ({
                id: uuidv4(),
                type: msg.role === "user" ? "user" : "ai",
                content: msg.content,
                timestamp: new Date(msg.timestamp || new Date()),
                personalizationContext: msg.personalization_context || null,
              })
            );

            setMessages(formattedMessages);
          }
        } catch (error) {
          console.error("Error loading active conversation:", error);
        }
      }
    };

    loadActiveConversation();
  }, [user, location.state]);

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isTyping || !user?.id) return;

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      type: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      let conversationId = activeConversation?.id;
      const response: ChatResponse = await getPersonalizedChatResponse(
        user.id,
        input,
        conversationId
      );

      if (!conversationId) {
        // Create a new conversation with the message and response
        const newConversation = await createConversation(
          user.id,
          input,
          response.content,
          response.personalizationContext ?? undefined
        );
        conversationId = newConversation.id;
        setActiveConversation(newConversation);
      } else {
        // Add the response to the existing conversation
        await addMessageToConversation(
          conversationId,
          input,
          response.content,
          response.personalizationContext ?? undefined
        );
      }

      // Add AI message to UI
      const aiMessage: Message = {
        id: uuidv4(),
        type: "ai",
        content: response.content,
        timestamp: new Date(),
        personalizationContext: response.personalizationContext,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting chat response:", error);

      // Add error message
      const errorMessage: Message = {
        id: uuidv4(),
        type: "system",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
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

  // Handle suggested prompt click
  const handleSuggestedPromptClick = (prompt: string) => {
    setInput(prompt);
  };

  // Navigate to dashboard
  const navigateToDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };

  // Toggle conversation sidebar
  const toggleConversationSidebar = () => {
    setShowConversationSidebar(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* Header */}
      <ChatHeader
        navigateToDashboard={navigateToDashboard}
        toggleConversationSidebar={toggleConversationSidebar}
        handleNewChat={handleNewChat}
        hasActiveConversation={!!activeConversation}
      />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-3xl mx-auto">
          {showProfilePrompt && (
            <ProfilePrompt
              onClose={() => setShowProfilePrompt(false)}
              onSetupProfile={() => navigate(ROUTES.PROFILE)}
            />
          )}
          {messages.length === 0 ? (
            <EmptyChatState
              suggestedPrompts={SUGGESTED_PROMPTS}
              onPromptClick={handleSuggestedPromptClick}
            />
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  index={index}
                  showContextInfo={showContextInfo}
                  toggleContextInfo={toggleContextInfo}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isTyping={isTyping}
      />

      {/* Conversation Sidebar */}
      <ConversationSidebar
        userId={user?.id || ""}
        isOpen={showConversationSidebar}
        onClose={() => setShowConversationSidebar(false)}
        onSelectConversation={(conversation) => {
          // Load the selected conversation
          setActiveConversation(conversation);

          // Format messages from conversation
          const formattedMessages: Message[] = conversation.messages.map(
            (msg: ConversationMessage) => ({
              id: uuidv4(),
              type: msg.role === "user" ? "user" : "ai",
              content: msg.content,
              timestamp: new Date(msg.timestamp || new Date()),
              personalizationContext: msg.personalization_context || null,
            })
          );

          setMessages(formattedMessages);
          setShowConversationSidebar(false);
        }}
        onNewChat={handleNewChat}
        activeConversationId={activeConversation?.id}
      />
    </div>
  );
};

export default Chat;
