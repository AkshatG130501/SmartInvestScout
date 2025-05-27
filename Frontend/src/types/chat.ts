/**
 * @file Chat types
 * @description Type definitions for the chat functionality
 */

import { Conversation } from "../lib/api/types";

/**
 * Message role type
 */
export type MessageRole = "user" | "ai" | "system";

/**
 * Personalization context type
 */
export interface PersonalizationContext {
  riskAppetite: string;
  investmentGoals: string[];
  watchlist: string[];
  holdings: string[];
  insightsContext?: string;
}

/**
 * Message type definition
 */
export interface Message {
  id: string;
  type: MessageRole;
  content: string;
  timestamp: Date;
  personalizationContext?: PersonalizationContext | null;
}

/**
 * Props for MessageBubble component
 */
export interface MessageBubbleProps {
  message: Message;
  index: number;
  showContextInfo: number | null;
  toggleContextInfo: (index: number) => void;
}

/**
 * Props for PersonalizationContextPanel component
 */
export interface PersonalizationContextPanelProps {
  context: PersonalizationContext;
  onClose: () => void;
}

/**
 * Props for SuggestedPrompt component
 */
export interface SuggestedPromptProps {
  prompt: string;
  onClick: (prompt: string) => void;
}

/**
 * Props for ProfilePrompt component
 */
export interface ProfilePromptProps {
  onClose: () => void;
  onSetupProfile: () => void;
}

/**
 * Props for ChatInput component
 */
export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isTyping: boolean;
}

/**
 * Props for ChatHeader component
 */
export interface ChatHeaderProps {
  navigateToDashboard: () => void;
  toggleConversationSidebar: () => void;
  handleNewChat: () => void;
  hasActiveConversation: boolean;
}

/**
 * Context for a chat question
 */
export interface ChatQuestionContext {
  company?: string;
  market_summary?: {
    summary: string;
    key_drivers: string;
    market_reaction: string;
  };
  [key: string]: any;
}
