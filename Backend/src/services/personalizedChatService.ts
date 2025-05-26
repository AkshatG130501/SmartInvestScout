import { OpenAI } from 'openai';
import { UserProfile } from '../types/userProfile';
import { ProfileService } from './profileService';
import { logger } from '../utils/logger';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_BASE_URL = 'https://api.perplexity.ai';

interface ChatResponse {
  content: string;
  personalizationContext: {
    riskAppetite: string;
    investmentGoals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
}

export class PersonalizedChatService {
  private static instance: PersonalizedChatService;
  private client: OpenAI;
  private profileService: ProfileService;

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
    this.profileService = ProfileService.getInstance();
  }

  public static getInstance(): PersonalizedChatService {
    if (!PersonalizedChatService.instance) {
      PersonalizedChatService.instance = new PersonalizedChatService();
    }
    return PersonalizedChatService.instance;
  }

  /**
   * Generate a personalized chat response based on user profile and query
   */
  async getPersonalizedResponse(userId: string, query: string): Promise<ChatResponse> {
    try {
      // Get user profile
      const userProfile = await this.profileService.getUserProfile(userId);

      if (!userProfile) {
        // If no profile exists, just use the query without personalization
        return this.getNonPersonalizedResponse(query);
      }

      // Construct personalized prompt
      const personalizedPrompt = this.constructPersonalizedPrompt(userProfile, query);

      // Get response from Sonar API
      const response = await this.client.chat.completions.create({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content:
              "You are a financial assistant providing personalized investment advice based on the user's profile.",
          },
          {
            role: 'user',
            content: personalizedPrompt,
          },
        ],
      });

      const content =
        response.choices[0].message.content || "Sorry, I couldn't generate a response.";

      return {
        content,
        personalizationContext: {
          riskAppetite: userProfile.risk_appetite,
          investmentGoals: userProfile.investment_goals,
          watchlist: userProfile.watchlist,
          holdings: userProfile.holdings.map((h) => h.name),
        },
      };
    } catch (error) {
      logger.error('Error in getPersonalizedResponse:', error);
      return {
        content: 'Sorry, there was an error processing your request.',
        personalizationContext: null,
      };
    }
  }

  /**
   * Get a non-personalized response when user profile is not available
   */
  private async getNonPersonalizedResponse(query: string): Promise<ChatResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content:
              'You are a financial assistant providing investment advice. Respond in Markdown format. Do not include citations or references like [1], [source], etc.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
      });

      const content =
        response.choices[0].message.content || "Sorry, I couldn't generate a response.";

      return {
        content,
        personalizationContext: null,
      };
    } catch (error) {
      logger.error('Error in getNonPersonalizedResponse:', error);
      return {
        content: 'Sorry, there was an error processing your request.',
        personalizationContext: null,
      };
    }
  }

  /**
   * Extract insights context from a query if it exists
   * This handles the case where the frontend prepends insights context to the query
   */
  private extractInsightsContext(query: string): {
    extractedQuery: string;
    insightsContext: string | null;
  } {
    // Check if the query contains the insights context marker
    const contextMarker = 'Context about ';
    const questionMarker = '\n\nQuestion: ';

    if (query.includes(contextMarker) && query.includes(questionMarker)) {
      const contextStartIndex = query.indexOf(contextMarker);
      const questionStartIndex = query.indexOf(questionMarker);

      if (contextStartIndex >= 0 && questionStartIndex > contextStartIndex) {
        const insightsContext = query.substring(contextStartIndex, questionStartIndex);
        const extractedQuery = query.substring(questionStartIndex + questionMarker.length);

        return { extractedQuery, insightsContext };
      }
    }

    // If no context markers found, return the original query
    return { extractedQuery: query, insightsContext: null };
  }

  private constructPersonalizedPrompt(profile: UserProfile, query: string): string {
    // Extract insights context if present
    const { extractedQuery, insightsContext } = this.extractInsightsContext(query);

    const holdingsStr =
      profile.holdings.length > 0
        ? profile.holdings.map((h) => `- ${h.name} (${h.symbol})`).join('\n')
        : '- None';

    const goalsStr = profile.investment_goals.map((g) => `- ${g}`).join('\n');
    const watchlistStr = profile.watchlist.map((w) => `- ${w}`).join('\n');

    // Build the prompt with insights context if available
    let prompt = `## User Financial Profile
  
  **Risk Appetite:** ${profile.risk_appetite}
  
  **Investment Goals:**
  ${goalsStr}
  
  **Watchlist:**
  ${watchlistStr}
  
  **Holdings:**
  ${holdingsStr}
  `;

    // Add insights context if available
    if (insightsContext) {
      prompt += `
  ## Insights Context
  ${insightsContext}
  `;
    }

    prompt += `
  ---
  
  ### User's Question
  > ${extractedQuery}
  
  ---
  
  ### Instructions for the Assistant
  - Tailor the answer to their **risk level** and **investment goals**.
  - If the query mentions stocks or sectors in their **watchlist** or **holdings**, highlight those.
  - If insights context is provided, use it to provide more relevant and specific information.
  - If the query is about **investment strategies**, align your advice accordingly.
  - Format the entire response in **Markdown**.
  - **Do not** include citations or numbered references like [1], [2], or [source].
  `;

    return prompt;
  }

  /**
   * Get a streaming personalized chat response
   */
  async getPersonalizedResponseStream(
    userId: string,
    query: string
  ): Promise<{
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
    context: {
      riskAppetite: string;
      investmentGoals: string[];
      watchlist: string[];
      holdings: string[];
    } | null;
  }> {
    try {
      // Get user profile
      const userProfile = await this.profileService.getUserProfile(userId);

      let personalizedPrompt = query;
      let context = null;

      if (userProfile) {
        // Construct personalized prompt
        personalizedPrompt = this.constructPersonalizedPrompt(userProfile, query);
        context = {
          riskAppetite: userProfile.risk_appetite,
          investmentGoals: userProfile.investment_goals,
          watchlist: userProfile.watchlist,
          holdings: userProfile.holdings.map((h) => h.name),
        };
      }

      // Get streaming response from Sonar API
      const stream = await this.client.chat.completions.create({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content:
              "You are a financial assistant providing personalized investment advice based on the user's profile.",
          },
          {
            role: 'user',
            content: personalizedPrompt,
          },
        ],
        stream: true,
      });

      return { stream, context };
    } catch (error) {
      logger.error('Error in getPersonalizedResponseStream:', error);
      throw new Error('Failed to get personalized response stream');
    }
  }
}
