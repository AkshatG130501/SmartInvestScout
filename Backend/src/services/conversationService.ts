import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';
import { 
  Conversation, 
  ConversationsResponse, 
  CreateConversationInput, 
  AddMessageInput 
} from '../types/conversation';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class ConversationService {
  private static instance: ConversationService;

  private constructor() {}

  public static getInstance(): ConversationService {
    if (!ConversationService.instance) {
      ConversationService.instance = new ConversationService();
    }
    return ConversationService.instance;
  }

  /**
   * Create a new conversation with an initial message and response
   */
  async createConversation(input: CreateConversationInput): Promise<Conversation | null> {
    try {
      // Check if the table exists by attempting a minimal query
      const { error: tableCheckError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1);
      
      if (tableCheckError) {
        logger.error(`Table check error: ${tableCheckError.message}`);
        throw new Error(`Table 'conversations' may not exist: ${tableCheckError.message}`);
      }
      
      // First, mark any existing active conversations as inactive
      await this.deactivateUserConversations(input.userId);
      
      // Generate title if not provided
      const title = input.title || this.generateTitle(input.message);
      
      // Create the initial message array
      const messages = [
        {
          role: 'user',
          content: input.message,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: input.response,
          personalization_context: input.personalizationContext || null,
          timestamp: new Date().toISOString()
        }
      ];
      
      // Insert the conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          {
            user_id: input.userId,
            title,
            messages,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error(`Error creating conversation: ${error.message}`);
        throw new Error(`Supabase error: ${error.message}`);
      }

      logger.info(`Conversation created successfully for user ${input.userId}`);
      return data as Conversation;
    } catch (error) {
      logger.error('Error in createConversation:', error);
      throw error;
    }
  }
  
  /**
   * Deactivate all active conversations for a user
   */
  async deactivateUserConversations(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) {
        logger.error(`Error deactivating conversations: ${error.message}`);
      }
    } catch (error) {
      logger.error('Error in deactivateUserConversations:', error);
    }
  }

  /**
   * Add a message to an existing conversation
   */
  async addMessageToConversation(input: AddMessageInput): Promise<Conversation | null> {
    try {
      // Get the current conversation
      const { data: conversation, error: getError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', input.conversationId)
        .single();
      
      if (getError) {
        logger.error(`Error fetching conversation: ${getError.message}`);
        throw new Error(`Supabase error: ${getError.message}`);
      }
      
      if (!conversation) {
        throw new Error(`Conversation with ID ${input.conversationId} not found`);
      }
      
      // Add new messages to the conversation
      const updatedMessages = [
        ...(conversation.messages || []),
        {
          role: 'user',
          content: input.message,
          timestamp: new Date().toISOString()
        },
        {
          role: 'assistant',
          content: input.response,
          personalization_context: input.personalizationContext || null,
          timestamp: new Date().toISOString()
        }
      ];
      
      // Update the conversation
      const { data, error } = await supabase
        .from('conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', input.conversationId)
        .select()
        .single();
      
      if (error) {
        logger.error(`Error updating conversation: ${error.message}`);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      logger.info(`Message added to conversation ${input.conversationId}`);
      return data as Conversation;
    } catch (error) {
      logger.error('Error in addMessageToConversation:', error);
      throw error;
    }
  }

  /**
   * Get the active conversation for a user
   */
  async getActiveConversation(userId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        // If no active conversation is found, this is not an error
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error(`Error fetching active conversation: ${error.message}`);
        return null;
      }
      
      return data as Conversation;
    } catch (error) {
      logger.error('Error in getActiveConversation:', error);
      return null;
    }
  }

  /**
   * Get all conversations for a user with pagination
   */
  async getConversations(
    userId: string,
    limit: number = 20,
    cursor?: string
  ): Promise<ConversationsResponse> {
    try {
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit + 1); // Fetch one extra to determine if there are more

      // Apply cursor-based pagination if cursor is provided
      if (cursor) {
        const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
        const { timestamp } = JSON.parse(decodedCursor);
        query = query.lt('updated_at', timestamp);
      }

      const { data, error } = await query;

      if (error) {
        logger.error(`Error fetching conversations: ${error.message}`);
        throw new Error(`Supabase error: ${error.message}`);
      }

      // Check if there are more results
      const hasMore = data && data.length > limit;
      const conversations = hasMore ? data.slice(0, limit) : data || [];

      // Create next cursor if there are more results
      let nextCursor;
      if (hasMore && conversations.length > 0) {
        const lastConversation = conversations[conversations.length - 1];
        const cursorData = { timestamp: lastConversation.updated_at };
        nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
      }

      return {
        conversations: conversations as Conversation[],
        hasMore,
        nextCursor
      };
    } catch (error) {
      logger.error('Error in getConversations:', error);
      throw error;
    }
  }

  /**
   * Get a conversation by ID
   */
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
      
      if (error) {
        logger.error(`Error fetching conversation: ${error.message}`);
        return null;
      }
      
      return data as Conversation;
    } catch (error) {
      logger.error('Error in getConversationById:', error);
      return null;
    }
  }
  
  /**
   * Activate a specific conversation
   */
  async activateConversation(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      if (error) {
        logger.error(`Error activating conversation: ${error.message}`);
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      logger.info(`Conversation ${conversationId} activated successfully`);
    } catch (error) {
      logger.error('Error in activateConversation:', error);
      throw error;
    }
  }

  // Using getConversationById instead

  /**
   * Delete a conversation
   */
  async deleteConversation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error(`Error deleting conversation: ${error.message}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteConversation:', error);
      return false;
    }
  }

  /**
   * Delete all conversations for a user
   */
  async deleteAllConversations(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', userId);

      if (error) {
        logger.error(`Error deleting conversations: ${error.message}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteAllConversations:', error);
      return false;
    }
  }

  /**
   * Generate a title for a conversation based on the first message
   */
  private generateTitle(message: string): string {
    // Truncate and clean the message to create a title
    const maxLength = 50;
    let title = message.trim();
    
    // Remove markdown formatting
    title = title.replace(/[#*`_~]/g, '');
    
    // Truncate if necessary
    if (title.length > maxLength) {
      title = title.substring(0, maxLength) + '...';
    }
    
    return title;
  }
}
