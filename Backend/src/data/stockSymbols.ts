/**
 * @file Stock symbols data
 * @description Common stock symbols and companies as a fallback data source
 */

export interface StockItem {
  symbol: string;
  name: string;
  sector?: string;
}

/**
 * Popular stock symbols and companies
 * Used as a fallback when the API is unavailable
 */
export const popularStocks: StockItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'Consumer Defensive' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'Financial Services' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare' },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial Services' },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare' },
  { symbol: 'DIS', name: 'Walt Disney Co.', sector: 'Communication Services' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'Communication Services' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', sector: 'Technology' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', sector: 'Communication Services' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', sector: 'Energy' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', sector: 'Communication Services' },
  { symbol: 'INTC', name: 'Intel Corporation', sector: 'Technology' },
  { symbol: 'T', name: 'AT&T Inc.', sector: 'Communication Services' },
  { symbol: 'CVX', name: 'Chevron Corporation', sector: 'Energy' },
  { symbol: 'ABT', name: 'Abbott Laboratories', sector: 'Healthcare' },
  { symbol: 'KO', name: 'Coca-Cola Co.', sector: 'Consumer Defensive' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', sector: 'Consumer Defensive' }
];

/**
 * Popular investment domains and sectors
 */
export const investmentDomains: string[] = [
  'Green Energy',
  'Renewable Energy',
  'Solar Power',
  'Wind Energy',
  'Electric Vehicles',
  'Artificial Intelligence',
  'Machine Learning',
  'Blockchain',
  'Cryptocurrency',
  'Bitcoin',
  'Ethereum',
  'Banking Sector',
  'Financial Services',
  'Investment Banking',
  'Healthcare',
  'Biotechnology',
  'Pharmaceuticals',
  'Real Estate',
  'REITs',
  'E-commerce',
  'Cloud Computing',
  'Cybersecurity',
  'Semiconductors',
  'Telecommunications',
  '5G Technology',
  'Internet of Things',
  'Retail',
  'Consumer Goods',
  'Aerospace',
  'Defense',
  'Agriculture',
  'Food Production',
  'Entertainment',
  'Streaming Services',
  'Gaming',
  'Social Media',
  'Advertising',
  'Transportation',
  'Logistics',
  'Manufacturing',
  'Construction',
  'Utilities',
  'Water Resources',
  'Waste Management',
  'Recycling'
];
