import { Router } from 'express';
import { ChatHistoryService } from '../services/chatHistoryService';
import { CreateConversationInput, CreateMessageInput } from '../types/chatHistory';
import { logger } from '../utils/logger';

export const chatHistoryRouter = Router();
const chatHistoryService = ChatHistoryService.getInstance();

// Get all conversations for a user
chatHistoryRouter.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const conversations = await chatHistoryService.getUserConversations(userId);
    
    return res.status(200).json(conversations);
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific conversation with messages
chatHistoryRouter.get('/conversations/:userId/:conversationId', async (req, res) => {
  try {
    const { userId, conversationId } = req.params;
    
    const conversation = await chatHistoryService.getConversation(conversationId, userId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    return res.status(200).json(conversation);
  } catch (error) {
    logger.error('Error fetching conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new conversation
chatHistoryRouter.post('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversationData: CreateConversationInput = req.body;
    
    const conversation = await chatHistoryService.createConversation(userId, conversationData);
    
    if (!conversation) {
      return res.status(500).json({ message: 'Failed to create conversation' });
    }
    
    return res.status(201).json(conversation);
  } catch (error) {
    logger.error('Error creating conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a conversation title
chatHistoryRouter.put('/conversations/:userId/:conversationId', async (req, res) => {
  try {
    const { userId, conversationId } = req.params;
    const { title } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    const success = await chatHistoryService.updateConversationTitle(conversationId, userId, title);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to update conversation' });
    }
    
    return res.status(200).json({ message: 'Conversation updated successfully' });
  } catch (error) {
    logger.error('Error updating conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a conversation
chatHistoryRouter.delete('/conversations/:userId/:conversationId', async (req, res) => {
  try {
    const { userId, conversationId } = req.params;
    
    const success = await chatHistoryService.deleteConversation(conversationId, userId);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete conversation' });
    }
    
    return res.status(204).send();
  } catch (error) {
    logger.error('Error deleting conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a message to a conversation
chatHistoryRouter.post('/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const messageData: CreateMessageInput = req.body;
    
    const message = await chatHistoryService.createMessage(userId, messageData);
    
    if (!message) {
      return res.status(500).json({ message: 'Failed to create message' });
    }
    
    return res.status(201).json(message);
  } catch (error) {
    logger.error('Error creating message:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Search conversations
chatHistoryRouter.get('/search/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    const conversations = await chatHistoryService.searchConversations(userId, query);
    
    return res.status(200).json(conversations);
  } catch (error) {
    logger.error('Error searching conversations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Search messages within a conversation
chatHistoryRouter.get('/search/messages/:userId/:conversationId', async (req, res) => {
  try {
    const { userId, conversationId } = req.params;
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    const messages = await chatHistoryService.searchMessages(conversationId, userId, query);
    
    return res.status(200).json(messages);
  } catch (error) {
    logger.error('Error searching messages:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
