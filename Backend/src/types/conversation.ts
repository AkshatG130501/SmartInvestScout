/**
 * A conversation containing multiple chat messages
 */
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  messages: ConversationMessage[];
  created_at: string;
  updated_at: string;
}

/**
 * A message within a conversation
 */
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  personalization_context?: {
    riskAppetite: string;
    investmentGoals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
  timestamp: string;
}

/**
 * Paginated response for conversations
 */
export interface ConversationsResponse {
  conversations: Conversation[];
  hasMore: boolean;
  nextCursor?: string;
}

/**
 * Input for creating a new conversation
 */
export interface CreateConversationInput {
  userId: string;
  title: string;
  message: string;
  response: string;
  personalizationContext?: any;
}

/**
 * Input for adding a message to an existing conversation
 */
export interface AddMessageInput {
  conversationId: string;
  message: string;
  response: string;
  personalizationContext?: any;
}
