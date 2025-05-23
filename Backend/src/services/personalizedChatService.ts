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
            content: 'You are a financial assistant providing personalized investment advice based on the user\'s profile.'
          },
          {
            role: 'user',
            content: personalizedPrompt
          }
        ]
      });

      const content = response.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';

      return {
        content,
        personalizationContext: {
          riskAppetite: userProfile.risk_appetite,
          investmentGoals: userProfile.investment_goals,
          watchlist: userProfile.watchlist,
          holdings: userProfile.holdings.map(h => h.name)
        }
      };
    } catch (error) {
      logger.error('Error in getPersonalizedResponse:', error);
      return {
        content: 'Sorry, there was an error processing your request.',
        personalizationContext: null
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
            content: 'You are a financial assistant providing investment advice.'
          },
          {
            role: 'user',
            content: query
          }
        ]
      });

      const content = response.choices[0].message.content || 'Sorry, I couldn\'t generate a response.';

      return {
        content,
        personalizationContext: null
      };
    } catch (error) {
      logger.error('Error in getNonPersonalizedResponse:', error);
      return {
        content: 'Sorry, there was an error processing your request.',
        personalizationContext: null
      };
    }
  }

  /**
   * Construct a personalized prompt based on user profile
   */
  private constructPersonalizedPrompt(profile: UserProfile, query: string): string {
    // Format holdings as a readable string
    const holdingsStr = profile.holdings.length > 0
      ? profile.holdings.map(h => `${h.name} (${h.symbol})`).join(', ')
      : 'None';

    // Format investment goals as a readable string
    const goalsStr = profile.investment_goals.join(', ');

    // Construct the prompt
    return `You are a financial assistant for a user with the following profile:
- Risk appetite: ${profile.risk_appetite}
- Goals: ${goalsStr}
- Watchlist: ${profile.watchlist.join(', ')}
- Holdings: ${holdingsStr}

Now answer this question from the user:
"${query}"

Tailor the answer to their risk level and current interests. If the query is about stocks or sectors in their watchlist or holdings, highlight that connection. If the query is about investment strategies, align your advice with their risk appetite and goals.`;
  }

  /**
   * Get a streaming personalized chat response
   */
  async getPersonalizedResponseStream(
    userId: string,
    query: string
  ): Promise<{ stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>, context: any }> {
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
          holdings: userProfile.holdings.map(h => h.name)
        };
      }
      
      // Get streaming response from Sonar API
      const stream = await this.client.chat.completions.create({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a financial assistant providing personalized investment advice based on the user\'s profile.'
          },
          {
            role: 'user',
            content: personalizedPrompt
          }
        ],
        stream: true
      });

      return { stream, context };
    } catch (error) {
      logger.error('Error in getPersonalizedResponseStream:', error);
      throw new Error('Failed to get personalized response stream');
    }
  }
}
