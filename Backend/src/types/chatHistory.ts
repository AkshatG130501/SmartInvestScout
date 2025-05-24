/**
 * A single chat message exchange between user and system
 */
export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  personalization_context?: {
    riskAppetite: string;
    investmentGoals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
  created_at: string;
}

/**
 * Paginated response for chat history
 */
export interface ChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
}
