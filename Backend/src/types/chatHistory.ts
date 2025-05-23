export interface ChatMessage {
  id: string;
  user_id: string;
  conversation_id: string;
  content: string;
  is_user_message: boolean;
  personalization_context?: {
    risk_appetite: string;
    investment_goals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  last_message_at: string;
  created_at: string;
  messages?: ChatMessage[];
}

export interface CreateConversationInput {
  title: string;
}

export interface CreateMessageInput {
  conversation_id: string;
  content: string;
  is_user_message: boolean;
  personalization_context?: {
    risk_appetite: string;
    investment_goals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
}
