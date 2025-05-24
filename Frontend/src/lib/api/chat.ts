import api from './client';
import { ChatResponse, ChatHistoryResponse, ChatMessage } from './types';
import { formatErrorMessage } from './errors';

/**
 * Gets a personalized chat response based on user profile
 * @param userId The ID of the user
 * @param query The user's query
 * @param conversationId Optional ID of the conversation to add this message to
 * @returns The personalized chat response
 */
export const getPersonalizedChatResponse = async (
  userId: string, 
  query: string,
  conversationId?: string
): Promise<ChatResponse> => {
  try {
    const response = await api.post('api/chat/personalized-query', { 
      userId, 
      query,
      conversationId
    });
    return response.data as ChatResponse;
  } catch (error: unknown) {
    console.error("Error getting personalized chat response:", formatErrorMessage(error));
    throw error;
  }
};

/**
 * Saves a chat message and its response to the database
 * @param userId The ID of the user
 * @param message The user's message
 * @param response The system's response
 * @returns The saved chat message
 */
export const saveChatMessage = async (
  userId: string, 
  message: string, 
  response: string
): Promise<ChatMessage> => {
  try {
    const result = await api.post('api/chat/history', { userId, message, response });
    return result.data as ChatMessage;
  } catch (error: unknown) {
    console.error("Error saving chat message:", formatErrorMessage(error));
    throw error;
  }
};

/**
 * Gets the chat history for a user
 * @param userId The ID of the user
 * @param limit The maximum number of messages to return
 * @param cursor The pagination cursor for fetching more messages
 * @returns The chat history response
 */
export const getChatHistory = async (
  userId: string, 
  limit: number = 20, 
  cursor?: string
): Promise<ChatHistoryResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (cursor) {
      params.append('cursor', cursor);
    }
    
    const response = await api.get(`api/chat/history/${userId}?${params.toString()}`);
    return response.data as ChatHistoryResponse;
  } catch (error: unknown) {
    console.error("Error fetching chat history:", formatErrorMessage(error));
    throw error;
  }
};
