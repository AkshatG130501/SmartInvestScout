import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';

interface MarketSummary {
  whats_happening: string;
  key_drivers: string;
  market_reaction: string;
}

interface RiskFactors {
  regulatory: string;
  competition: string;
  product_delays: string;
}

interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
}

export interface StockInsight {
  company: string;
  last_updated: string;
  market_summary: MarketSummary;
  risk_factors: RiskFactors;
  latest_news: NewsItem[];
  follow_up_questions: string[];
}

export class PerplexityService {
  private static instance: PerplexityService;
  private client: OpenAI;

  private constructor() {
    if (!PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key not found');
    }

    this.client = new OpenAI({
      apiKey: PERPLEXITY_API_KEY,
      baseURL: PERPLEXITY_BASE_URL,
    });
  }

  public static getInstance(): PerplexityService {
    if (!PerplexityService.instance) {
      PerplexityService.instance = new PerplexityService();
    }
    return PerplexityService.instance;
  }

  private cleanJsonResponse(content: string): string {
    // Remove markdown code block if present
    let cleaned = content.replace(/```json\n?|\n?```/g, '');

    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();

    // If the response is wrapped in a code block with language specification
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      return cleaned;
    }

    // Try to find JSON object in the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    throw new Error('Could not find valid JSON in the response');
  }

  async getStockInsights(stockSymbol: string): Promise<StockInsight> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content:
            'You are a financial analysis AI assistant that provides detailed, accurate, and up-to-date stock market insights. Always respond with valid JSON only, without any markdown formatting or additional text. Ensure the content for each field is brief and concise, suitable for display in a UI.',
        },
        {
          role: 'user' as const,
          content: `Give me the most recent and up-to-date market insights and news for the stock ${stockSymbol} as of today in the following JSON format:

{
  "company": "${stockSymbol}",
  "last_updated": "ISO8601 timestamp",
  "market_summary": {
    "whats_happening": "Briefly describe latest events affecting the stock",
    "key_drivers": "Briefly describe current main factors driving stock price",
    "market_reaction": "Briefly describe recent market response to developments"
  },
  "risk_factors": {
    "regulatory": "Briefly describe latest regulatory issues",
    "competition": "Briefly describe recent competitive threats",
    "product_delays": "Briefly describe any current product delays or concerns"
  },
  "latest_news": [
    {
      "headline": "Concise news headline",
      "summary": "Very brief description",
      "source": "News outlet name",
      "url": "Link to the article"
    }
  ],
  "follow_up_questions": [
    "Concise follow-up question 1",
    "Concise follow-up question 2",
    "Concise follow-up question 3"
  ]
}

Make sure the data is based on the most recent developments as of today. Avoid outdated information. Respond with valid JSON only. Keep the content brief and suitable for a UI display.`,
        },
      ];

      const response = await this.client.chat.completions.create({
        model: 'sonar-pro',
        messages,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from Perplexity API');
      }

      const cleanedContent = this.cleanJsonResponse(content);
      const parsedContent = JSON.parse(cleanedContent) as StockInsight;
      return parsedContent;
    } catch (error) {
      console.error('Error fetching stock insights:', error);
      throw new Error('Failed to fetch stock insights');
    }
  }

  async getStockInsightsStream(stockSymbol: string) {
    try {
      const messages = [
        {
          role: 'system' as const,
          content:
            'You are a financial analysis AI assistant that provides detailed, accurate, and up-to-date stock market insights. Always respond with valid JSON only, without any markdown formatting or additional text. Ensure the content for each field is brief and concise, suitable for display in a UI.',
        },
        {
          role: 'user' as const,
          content: `Give me the most recent and up-to-date market insights and news for the stock ${stockSymbol} as of today in the following JSON format:

{
  "company": "${stockSymbol}",
  "last_updated": "ISO8601 timestamp",
  "market_summary": {
    "whats_happening": "Briefly describe latest events affecting the stock",
    "key_drivers": "Briefly describe current main factors driving stock price",
    "market_reaction": "Briefly describe recent market response to developments"
  },
  "risk_factors": {
    "regulatory": "Briefly describe latest regulatory issues",
    "competition": "Briefly describe recent competitive threats",
    "product_delays": "Briefly describe any current product delays or concerns"
  },
  "latest_news": [
    {
      "headline": "Concise news headline",
      "summary": "Very brief description",
      "source": "News outlet name",
      "url": "Link to the article"
    }
  ],
  "follow_up_questions": [
    "Concise follow-up question 1",
    "Concise follow-up question 2",
    "Concise follow-up question 3"
  ]
}

Make sure the data is based on the most recent developments as of today. Avoid outdated information. Respond with valid JSON only. Keep the content brief and suitable for a UI display.`,
        },
      ];

      return await this.client.chat.completions.create({
        model: 'sonar-pro',
        messages,
        stream: true,
      });
    } catch (error) {
      console.error('Error fetching stock insights stream:', error);
      throw new Error('Failed to fetch stock insights stream');
    }
  }
}
