import { createClient } from '@supabase/supabase-js';
import { 
  ChatConversation, 
  ChatMessage, 
  CreateConversationInput, 
  CreateMessageInput 
} from '../types/chatHistory';
import { logger } from '../utils/logger';

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
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) {
        logger.error(`Error fetching conversations: ${error.message}`);
        return [];
      }

      return data as ChatConversation[];
    } catch (error) {
      logger.error('Error in getUserConversations:', error);
      return [];
    }
  }

  /**
   * Get a conversation by ID
   */
  async getConversation(conversationId: string, userId: string): Promise<ChatConversation | null> {
    try {
      // First, get the conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (conversationError) {
        logger.error(`Error fetching conversation: ${conversationError.message}`);
        return null;
      }

      // Then, get all messages for this conversation
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        logger.error(`Error fetching messages: ${messagesError.message}`);
        return conversation as ChatConversation;
      }

      return {
        ...conversation,
        messages: messages as ChatMessage[]
      } as ChatConversation;
    } catch (error) {
      logger.error('Error in getConversation:', error);
      return null;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(userId: string, data: CreateConversationInput): Promise<ChatConversation | null> {
    try {
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert([
          {
            user_id: userId,
            title: data.title
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error(`Error creating conversation: ${error.message}`);
        return null;
      }

      return conversation as ChatConversation;
    } catch (error) {
      logger.error('Error in createConversation:', error);
      return null;
    }
  }

  /**
   * Update a conversation's title
   */
  async updateConversationTitle(conversationId: string, userId: string, title: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ title })
        .eq('id', conversationId)
        .eq('user_id', userId);

      if (error) {
        logger.error(`Error updating conversation: ${error.message}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in updateConversationTitle:', error);
      return false;
    }
  }

  /**
   * Delete a conversation and all its messages
   */
  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      // First, delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (messagesError) {
        logger.error(`Error deleting messages: ${messagesError.message}`);
        return false;
      }

      // Then, delete the conversation
      const { error: conversationError } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', userId);

      if (conversationError) {
        logger.error(`Error deleting conversation: ${conversationError.message}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteConversation:', error);
      return false;
    }
  }

  /**
   * Add a message to a conversation
   */
  async createMessage(userId: string, data: CreateMessageInput): Promise<ChatMessage | null> {
    try {
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            user_id: userId,
            conversation_id: data.conversation_id,
            content: data.content,
            is_user_message: data.is_user_message,
            personalization_context: data.personalization_context || null
          }
        ])
        .select()
        .single();

      if (error) {
        logger.error(`Error creating message: ${error.message}`);
        return null;
      }

      return message as ChatMessage;
    } catch (error) {
      logger.error('Error in createMessage:', error);
      return null;
    }
  }

  /**
   * Search for conversations by title
   */
  async searchConversations(userId: string, query: string): Promise<ChatConversation[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .ilike('title', `%${query}%`)
        .order('last_message_at', { ascending: false });

      if (error) {
        logger.error(`Error searching conversations: ${error.message}`);
        return [];
      }

      return data as ChatConversation[];
    } catch (error) {
      logger.error('Error in searchConversations:', error);
      return [];
    }
  }

  /**
   * Search for messages within a conversation
   */
  async searchMessages(conversationId: string, userId: string, query: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: true });

      if (error) {
        logger.error(`Error searching messages: ${error.message}`);
        return [];
      }

      return data as ChatMessage[];
    } catch (error) {
      logger.error('Error in searchMessages:', error);
      return [];
    }
  }
}
