import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { logger } from './logger';

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

export interface DocumentSummary {
  documentType: string;
  dynamicSummary: string;
}

export interface FixedDocumentSummary {
  overview: string;
  keyThemes: string[];
  financialHighlights: Record<string, string>;
  risks: string[];
  tone: string;
  forwardLooking: string;
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
      logger.warn('Perplexity API key not found, using mock implementation');
      // Create a minimal client for type compatibility
      this.client = {} as OpenAI;
    } else {
      this.client = new OpenAI({
        apiKey: PERPLEXITY_API_KEY,
        baseURL: PERPLEXITY_BASE_URL,
      });
    }
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

  async getDocumentSummary(documentText: string): Promise<DocumentSummary> {
    try {
      // If API key is missing, return mock data
      if (!PERPLEXITY_API_KEY) {
        logger.warn('Using mock data for document summary due to missing API key');
        return this.getMockDocumentSummary(documentText);
      }

      // First, identify the document type
      const documentType = await this.identifyDocumentType(documentText);

      // Then, get a dynamic summary based on the document type
      const dynamicSummary = await this.getDynamicSummaryByType(documentText, documentType);

      return {
        documentType,
        dynamicSummary: dynamicSummary.markdown,
      };
    } catch (error) {
      logger.error('Error analyzing document:', error);
      // Return mock data if there's an error
      return this.getMockDocumentSummary(documentText);
    }
  }

  private async identifyDocumentType(documentText: string): Promise<string> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content:
            'You are a document classification AI that identifies document types. Always respond with valid JSON only, without any markdown formatting or additional text.',
        },
        {
          role: 'user' as const,
          content: `Analyze the following document and identify what type of document it is. Respond with a JSON object containing a single field 'documentType' with a specific classification (e.g., 'Annual Report', 'Financial Statement', 'Earnings Release', 'Investor Presentation', 'Research Report', 'Legal Contract', etc.). Be specific about the document type.\n\nHere is the document text:\n${documentText.substring(0, 15000)}`,
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
      const parsedContent = JSON.parse(cleanedContent);
      return parsedContent.documentType || 'Unknown Document';
    } catch (error) {
      logger.error('Error identifying document type:', error);
      return 'Unknown Document';
    }
  }

  private async getDynamicSummaryByType(
    documentText: string,
    documentType: string
  ): Promise<{ markdown: string }> {
    try {
      const promt = `Analyze the following ${documentType} and provide a comprehensive summary in Markdown format.
  
  Structure the summary with:
  
  - A bolded **Overview** section at the top.
  - Use ## for section headers.
  - Use ### for subsections, if needed.
  - Use bullet points or numbered lists for items.
  - Format nested or complex data (if any) as Markdown code blocks or nested lists.
  - **Do not include any citations, references, or source attributions.**
  
  Adapt the structure to best represent the content of this specific ${documentType}.
  
  Here is the document text:
  
  ${documentText.substring(0, 15000)}
  `;

      const messages = [
        {
          role: 'system' as const,
          content:
            'You are a document analysis AI that provides detailed, accurate summaries of documents in Markdown format. Include headings, bullet points, and code blocks where necessary. Avoid using HTML or JSON formatting unless part of the document content.',
        },
        {
          role: 'user' as const,
          content: promt,
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

      return {
        markdown: content.trim(),
      };
    } catch (error) {
      logger.error('Error getting markdown summary:', error);
      return {
        markdown: 'Error generating document summary.',
      };
    }
  }

  private getMockDocumentSummary(documentText: string): DocumentSummary {
    const sampleText = documentText.substring(0, 100).trim() + '...';

    return {
      documentType: 'Annual Report',
      dynamicSummary: `This is a mock summary for the document type 'Annual Report'. The content is based on the sample text provided: ${sampleText}`,
      // overview: `Document analysis based on sample: ${sampleText}`,
      // sections: {
      //   keyThemes: [
      //     'Financial performance metrics',
      //     'Market expansion strategy',
      //     'Risk management approach',
      //     'Technology investments',
      //   ],
      //   financialHighlights: {
      //     revenue: '₹1,250 Cr (+25% YoY)',
      //     ebitda: '₹280 Cr (+18% YoY)',
      //     netProfit: '₹175 Cr (+15% YoY)',
      //     cashFlow: '₹210 Cr (+20% YoY)',
      //   },
      //   risks: [
      //     'Regulatory changes in fintech sector',
      //     'Cybersecurity threats',
      //     'Market competition',
      //     'Currency fluctuations',
      //   ],
      //   tone: 'The document presents information in a professional and balanced manner, highlighting both opportunities and challenges.',
      //   forwardLooking:
      //     'The document indicates plans for expansion into new markets, investment in digital technologies, and development of new product offerings.',
      // },
    };
  }

  async getStockInsightsStream(
    stockSymbol: string
  ): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
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
