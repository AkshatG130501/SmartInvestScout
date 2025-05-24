import api from './client';
import { Conversation, ConversationsResponse } from './types';
import { formatErrorMessage } from './errors';

/**
 * Creates a new conversation
 * @param userId The ID of the user
 * @param message The user's message
 * @param response The system's response
 * @param personalizationContext Optional personalization context
 * @returns The created conversation
 */
export const createConversation = async (
  userId: string,
  message: string,
  response: string,
  personalizationContext?: any
): Promise<Conversation> => {
  try {
    const result = await api.post('api/conversations', {
      userId,
      message,
      response,
      personalizationContext
    });
    return result.data as Conversation;
  } catch (error: unknown) {
    console.error("Error creating conversation:", formatErrorMessage(error));
    throw error;
  }
};

/**
 * Adds a message to an existing conversation
 * @param conversationId The ID of the conversation
 * @param message The user's message
 * @param response The system's response
 * @param personalizationContext Optional personalization context
 * @returns The updated conversation
 */
export const addMessageToConversation = async (
  conversationId: string,
  message: string,
  response: string,
  personalizationContext?: any
): Promise<Conversation> => {
  try {
    const result = await api.post(`api/conversations/${conversationId}/messages`, {
      message,
      response,
      personalizationContext
    });
    return result.data as Conversation;
  } catch (error: unknown) {
    console.error("Error adding message to conversation:", formatErrorMessage(error));
    throw error;
  }
};

/**
 * Gets the active conversation for a user
 * @param userId The ID of the user
 * @returns The active conversation or null if none exists
 */
export const getActiveConversation = async (
  userId: string
): Promise<Conversation | null> => {
  try {
    const response = await api.get(`api/conversations/user/${userId}/active`);
    // Type assertion to handle the response data
    const responseData = response.data as { conversation: Conversation | null };
    return responseData.conversation;
  } catch (error: unknown) {
    console.error("Error fetching active conversation:", formatErrorMessage(error));
    return null;
  }
};

/**
 * Gets all conversations for a user
 * @param userId The ID of the user
 * @param limit The maximum number of conversations to return
 * @param cursor The pagination cursor for fetching more conversations
 * @returns The conversations response
 */
export const getConversations = async (
  userId: string,
  limit: number = 20,
  cursor?: string
): Promise<ConversationsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const response = await api.get(`api/conversations/user/${userId}?${params.toString()}`);
    return response.data as ConversationsResponse;
  } catch (error: unknown) {
    console.error("Error fetching conversations:", formatErrorMessage(error));
    throw error;
  }
};

/**
 * Gets a single conversation by ID
 * @param conversationId The ID of the conversation
 * @returns The conversation
 */
export const getConversation = async (
  conversationId: string
): Promise<Conversation> => {
  try {
    const response = await api.get(`api/conversations/${conversationId}`);
    return response.data as Conversation;
  } catch (error: unknown) {
    console.error("Error fetching conversation:", formatErrorMessage(error));
    throw error;
  }
};

/**
 * Deletes a conversation
 * @param conversationId The ID of the conversation
 * @returns True if the conversation was deleted successfully
 */
export const deleteConversation = async (
  conversationId: string
): Promise<boolean> => {
  try {
    await api.delete(`api/conversations/${conversationId}`);
    return true;
  } catch (error: unknown) {
    console.error("Error deleting conversation:", formatErrorMessage(error));
    throw error;
  }
};

/**
 * Deletes all conversations for a user
 * @param userId The ID of the user
 * @returns True if the conversations were deleted successfully
 */
export const deleteAllConversations = async (
  userId: string
): Promise<boolean> => {
  try {
    await api.delete(`api/conversations/user/${userId}`);
    return true;
  } catch (error: unknown) {
    console.error("Error deleting all conversations:", formatErrorMessage(error));
    throw error;
  }
};
