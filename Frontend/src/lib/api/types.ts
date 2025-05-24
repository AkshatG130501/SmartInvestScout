/**
 * @file Type definitions for the SmartInvestScout API
 * @description Contains all shared types used across API modules
 */

// ==============================
// Document Types
// ==============================

/**
 * Summary of an analyzed financial document
 */
export interface DocumentSummary {
  documentType: string;
  overview: string;
  sections: Record<string, unknown>;
}

// ==============================
// User Profile Types
// ==============================

/**
 * User's risk tolerance level
 */
export enum RiskAppetite {
  CONSERVATIVE = "conservative",
  MODERATE = "moderate",
  AGGRESSIVE = "aggressive",
}

/**
 * Investment objectives for the user
 */
export enum InvestmentGoal {
  LONG_TERM_GROWTH = "long_term_growth",
  PASSIVE_INCOME = "passive_income",
  RETIREMENT = "retirement",
  SHORT_TERM_GAINS = "short_term_gains",
  WEALTH_PRESERVATION = "wealth_preservation",
}

/**
 * Complete user profile with investment preferences
 */
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

/**
 * Input data for creating or updating a user profile
 */
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

// ==============================
// Chat Types
// ==============================

/**
 * Response from the personalized chat API
 */
export interface ChatResponse {
  content: string;
  personalizationContext: {
    riskAppetite: string;
    investmentGoals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
}

// ==============================
// Chat History Types
// ==============================

/**
 * A single chat message exchange between user and system
 */
export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
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
