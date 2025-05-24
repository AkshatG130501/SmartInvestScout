import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Define the types directly in this file since we're having issues with the import
interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  response: string;
  personalization_context?: {
    riskAppetite: string;
    investmentGoals: string[];
    watchlist: string[];
    holdings: string[];
  } | null;
  created_at: string;
}

interface ChatHistoryResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  nextCursor?: string;
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class ChatHistoryService {
  private static instance: ChatHistoryService;

  private constructor() {}

  public static getInstance(): ChatHistoryService {
    if (!ChatHistoryService.instance) {
      ChatHistoryService.instance = new ChatHistoryService();
    }
    return ChatHistoryService.instance;
  }

  /**
   * Save a chat message and its response to the database
   */
  async saveChatMessage(
    userId: string,
    message: string,
    response: string,
    personalizationContext?: any
  ): Promise<ChatMessage | null> {
    try {
      // Check if the table exists by attempting a minimal query
      const { error: tableCheckError } = await supabase
        .from('chat_history')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        logger.error(`Table check error: ${tableCheckError.message}`);
        throw new Error(`Table 'chat_history' may not exist: ${tableCheckError.message}`);
      }
      
      const { data, error } = await supabase
        .from('chat_history')
        .insert([
          {
            user_id: userId,
            message,
            response,
            personalization_context: personalizationContext || null
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error(`Error saving chat message: ${error.message}`);
        throw new Error(`Supabase error: ${error.message}`);
      }

      logger.info(`Chat message saved successfully for user ${userId}`);
      return data as ChatMessage;
    } catch (error) {
      logger.error('Error in saveChatMessage:', error);
      throw error;
    }
  }

  /**
   * Get chat history for a user with pagination
   */
  async getChatHistory(
    userId: string,
    limit: number = 20,
    cursor?: string
  ): Promise<ChatHistoryResponse> {
    try {
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit + 1); // Fetch one extra to determine if there are more

      // Apply cursor-based pagination if cursor is provided
      if (cursor) {
        const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
        const { timestamp } = JSON.parse(decodedCursor);
        query = query.lt('created_at', timestamp);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error fetching chat history: ${error.message}`);
        throw new Error(`Supabase error: ${error.message}`);
      }

      // Check if there are more results
      const hasMore = data && data.length > limit;
      const messages = hasMore ? data.slice(0, limit) : data || [];

      // Create next cursor if there are more results
      let nextCursor;
      if (hasMore && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const cursorData = { timestamp: lastMessage.created_at };
        nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
      }

      return {
        messages: messages as ChatMessage[],
        hasMore,
        nextCursor
      };
    } catch (error) {
      logger.error('Error in getChatHistory:', error);
      throw error;
    }
  }

  /**
   * Delete a chat message by ID
   */
  async deleteChatMessage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error(`Error deleting chat message: ${error.message}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteChatMessage:', error);
      return false;
    }
  }

  /**
   * Delete all chat history for a user
   */
  async deleteAllChatHistory(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error(`Error deleting chat history: ${error.message}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteAllChatHistory:', error);
      return false;
    }
  }
}
