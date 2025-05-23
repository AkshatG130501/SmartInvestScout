import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Document Types
export interface DocumentSummary {
  documentType: string;
  overview: string;
  sections: Record<string, unknown>;
}

// User Profile Types
export enum RiskAppetite {
  CONSERVATIVE = 'conservative',
  MODERATE = 'moderate',
  AGGRESSIVE = 'aggressive'
}

export enum InvestmentGoal {
  LONG_TERM_GROWTH = 'long_term_growth',
  PASSIVE_INCOME = 'passive_income',
  RETIREMENT = 'retirement',
  SHORT_TERM_GAINS = 'short_term_gains',
  WEALTH_PRESERVATION = 'wealth_preservation'
}

export interface UserProfile {
  id: string;
  user_id: string;
  risk_appetite: RiskAppetite;
  investment_goals: InvestmentGoal[];
  watchlist: string[];
  holdings: {
    symbol: string;
    name: string;
    quantity?: number;
  }[];
  created_at: string;
  updated_at: string;
}

export interface UserProfileInput {
  risk_appetite: RiskAppetite;
  investment_goals: InvestmentGoal[];
  watchlist: string[];
  holdings: {
    symbol: string;
    name: string;
    quantity?: number;
  }[];
}

export interface ChatResponse {
  content: string;
  personalizationContext: {
    riskAppetite: string;
    investmentGoals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
}

// Document API
export const uploadAndAnalyzeDocument = async (
  file: File
): Promise<DocumentSummary> => {
  // Create form data to send the file
  const formData = new FormData();
  formData.append("document", file);

  try {
    const response = await api.post("api/documents/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data as DocumentSummary;
  } catch (error) {
    console.error("Error analyzing document:", error);
    throw error;
  }
};

// User Profile API
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const response = await api.get(`api/profiles/${userId}`);
    return response.data as UserProfile;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Profile not found
    }
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const createUserProfile = async (userId: string, profileData: UserProfileInput): Promise<UserProfile> => {
  try {
    const response = await api.post(`api/profiles/${userId}`, profileData);
    return response.data as UserProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, profileData: Partial<UserProfileInput>): Promise<UserProfile> => {
  try {
    const response = await api.put(`api/profiles/${userId}`, profileData);
    return response.data as UserProfile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Chat API
export const getPersonalizedChatResponse = async (userId: string, query: string): Promise<ChatResponse> => {
  try {
    const response = await api.post('api/chat/personalized-query', { userId, query });
    return response.data as ChatResponse;
  } catch (error) {
    console.error("Error getting personalized chat response:", error);
    throw error;
  }
};

// Chat History Types
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

// Chat History API
export const getUserConversations = async (userId: string): Promise<ChatConversation[]> => {
  try {
    const response = await api.get(`api/chat-history/conversations/${userId}`);
    return response.data as ChatConversation[];
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return [];
  }
};

export const getConversation = async (userId: string, conversationId: string): Promise<ChatConversation | null> => {
  try {
    const response = await api.get(`api/chat-history/conversations/${userId}/${conversationId}`);
    return response.data as ChatConversation;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching conversation:", error);
    throw error;
  }
};

export const createConversation = async (userId: string, data: CreateConversationInput): Promise<ChatConversation> => {
  try {
    const response = await api.post(`api/chat-history/conversations/${userId}`, data);
    return response.data as ChatConversation;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

export const updateConversationTitle = async (userId: string, conversationId: string, title: string): Promise<void> => {
  try {
    await api.put(`api/chat-history/conversations/${userId}/${conversationId}`, { title });
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
};

export const deleteConversation = async (userId: string, conversationId: string): Promise<void> => {
  try {
    await api.delete(`api/chat-history/conversations/${userId}/${conversationId}`);
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

export const createMessage = async (userId: string, data: CreateMessageInput): Promise<ChatMessage> => {
  try {
    const response = await api.post(`api/chat-history/messages/${userId}`, data);
    return response.data as ChatMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
};

export const searchConversations = async (userId: string, query: string): Promise<ChatConversation[]> => {
  try {
    const response = await api.get(`api/chat-history/search/conversations/${userId}`, {
      params: { query }
    });
    return response.data as ChatConversation[];
  } catch (error: any) {
    console.error("Error searching conversations:", error);
    return [];
  }
};

export default api;
