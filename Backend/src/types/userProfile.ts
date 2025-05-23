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
  watchlist: string[]; // Array of interests (e.g., EVs, PSU banks, green energy)
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
