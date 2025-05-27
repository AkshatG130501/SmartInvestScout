/**
 * @file Chat UI Components
 * @description Reusable components for the chat interface
 */

import React from "react";
import { 
  MessageSquare, 
  Bot, 
  User, 
  Info, 
  X, 
  ArrowLeft,
  Plus,
  Send,
  Loader2
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { 
  MessageBubbleProps, 
  PersonalizationContextPanelProps,
  SuggestedPromptProps,
  ProfilePromptProps,
  ChatInputProps,
  ChatHeaderProps
} from "../../types/chat";

/**
 * Format context item for display
 */
const formatContextItem = (item: string): string => {
  return item.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Component for displaying a message bubble
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  index,
  showContextInfo,
  toggleContextInfo,
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
          <PersonalizationContextPanel 
            context={message.personalizationContext} 
            onClose={() => toggleContextInfo(index)} 
          />
        )}

        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

/**
 * Component for displaying personalization context
 */
export const PersonalizationContextPanel: React.FC<PersonalizationContextPanelProps> = ({ 
  context, 
  onClose 
}) => {
  return (
    <div className="mb-3 p-2 bg-indigo-50 rounded-md text-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="font-medium text-indigo-800">
          Personalization Context
        </span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-1">
        <div>
          <span className="font-medium">Risk Appetite:</span>{" "}
          {formatContextItem(context.riskAppetite)}
        </div>
        {context.investmentGoals && context.investmentGoals.length > 0 && (
          <div>
            <span className="font-medium">Investment Goals:</span>{" "}
            {context.investmentGoals
              .map(formatContextItem)
              .join(", ")}
          </div>
        )}
        {context.watchlist && context.watchlist.length > 0 && (
          <div>
            <span className="font-medium">Watchlist:</span>{" "}
            {context.watchlist.join(", ")}
          </div>
        )}
        {context.holdings && context.holdings.length > 0 && (
          <div>
            <span className="font-medium">Holdings:</span>{" "}
            {context.holdings.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Component for displaying a suggested prompt button
 */
export const SuggestedPrompt: React.FC<SuggestedPromptProps> = ({ 
  prompt, 
  onClick 
}) => (
  <button
    className="bg-white border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-lg p-3 text-left transition-colors duration-200"
    onClick={() => onClick(prompt)}
  >
    <div className="flex items-center space-x-2">
      <MessageSquare className="h-4 w-4 text-indigo-600" />
      <span className="text-sm text-gray-700">{prompt}</span>
    </div>
  </button>
);

/**
 * Component for displaying the profile setup prompt
 */
export const ProfilePrompt: React.FC<ProfilePromptProps> = ({ 
  onClose, 
  onSetupProfile 
}) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
    <div className="flex justify-between items-start">
      <div className="flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 font-medium">Personalize your experience</p>
          <p className="text-blue-700 text-sm mt-1">
            Set up your investment profile to get personalized recommendations
            tailored to your goals and risk appetite.
          </p>
          <button
            onClick={onSetupProfile}
            className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Set up profile
          </button>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-blue-400 hover:text-blue-600"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  </div>
);

/**
 * Component for the chat input area
 */
export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSubmit,
  isTyping
}) => (
  <div className="bg-white border-t border-gray-200 px-4 py-4">
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your investment question..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          disabled={isTyping}
        />
        <button
          type="submit"
          className={`p-3 rounded-lg ${
            isTyping
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          } transition-colors duration-200`}
          disabled={isTyping}
        >
          {isTyping ? (
            <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
          ) : (
            <Send className="h-5 w-5 text-white" />
          )}
        </button>
      </form>
    </div>
  </div>
);

/**
 * Component for the chat header
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  navigateToDashboard,
  toggleConversationSidebar,
  handleNewChat,
  hasActiveConversation
}) => (
  <div className="bg-white border-b border-gray-200 px-4 py-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <button
        onClick={navigateToDashboard}
        className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        <span>Back to Dashboard</span>
      </button>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleConversationSidebar}
          className="flex items-center px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:border-indigo-400 rounded-lg transition-colors duration-200"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Conversations
        </button>
        {hasActiveConversation && (
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
);

/**
 * Component for empty chat state with suggested prompts
 */
export const EmptyChatState: React.FC<{
  suggestedPrompts: string[];
  onPromptClick: (prompt: string) => void;
}> = ({ suggestedPrompts, onPromptClick }) => (
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
        <SuggestedPrompt
          key={index}
          prompt={prompt}
          onClick={onPromptClick}
        />
      ))}
    </div>
  </div>
);

/**
 * Component for displaying typing indicator
 */
export const TypingIndicator: React.FC = () => (
  <div className="flex items-center space-x-2 text-gray-500">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span>SmartInvest Scout is typing...</span>
  </div>
);
