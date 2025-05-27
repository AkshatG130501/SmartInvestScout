export interface MarketSummary {
  overview: string;
  keyPoints: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
}

export interface RiskFactors {
  category: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  mitigation?: string;
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface DocumentSummary {
  documentType: string;
  dynamicSummary: string;
  keyPoints: string[];
  recommendations: string[];
}

export interface FixedDocumentSummary extends DocumentSummary {
  overview: string;
  analysis: string;
  conclusion: string;
}

export interface StockInsight {
  symbol: string;
  companyName: string;
  currentPrice: number;
  marketCap: number;
  summary: MarketSummary;
  riskFactors: RiskFactors[];
  recentNews: NewsItem[];
  technicalAnalysis: {
    trend: string;
    support: number[];
    resistance: number[];
    indicators: {
      name: string;
      value: number;
      signal: 'buy' | 'sell' | 'neutral';
    }[];
  };
  fundamentalAnalysis: {
    peRatio: number;
    eps: number;
    dividendYield: number;
    revenue: number;
    profitMargin: number;
    debtToEquity: number;
  };
  recommendations: {
    analyst: string;
    rating: 'buy' | 'hold' | 'sell';
    targetPrice: number;
    rationale: string;
  }[];
}
