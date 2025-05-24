import { Router } from 'express';
import { ConversationService } from '../services/conversationService';
import { logger } from '../utils/logger';

export const conversationsRouter = Router();
const conversationService = ConversationService.getInstance();

// Create a new conversation
conversationsRouter.post('/', async (req, res) => {
  try {
    const { userId, title, message, response, personalizationContext } = req.body;
    
    if (!userId || !message || !response) {
      return res.status(400).json({ message: 'Missing required fields: userId, message, or response' });
    }
    
    const conversation = await conversationService.createConversation({
      userId,
      title: title || '',
      message,
      response,
      personalizationContext
    });
    
    return res.status(201).json(conversation);
  } catch (error) {
    logger.error('Error creating conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a message to an existing conversation
conversationsRouter.post('/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message, response, personalizationContext } = req.body;
    
    if (!conversationId || !message || !response) {
      return res.status(400).json({ message: 'Missing required fields: conversationId, message, or response' });
    }
    
    const updatedConversation = await conversationService.addMessageToConversation({
      conversationId,
      message,
      response,
      personalizationContext
    });
    
    return res.status(200).json(updatedConversation);
  } catch (error) {
    logger.error('Error adding message to conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Activate a specific conversation
conversationsRouter.post('/:conversationId/activate', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      return res.status(400).json({ message: 'Missing required parameter: conversationId' });
    }
    
    // Get the conversation to check if it exists and get the user ID
    const conversation = await conversationService.getConversationById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    // First deactivate all conversations for this user
    await conversationService.deactivateUserConversations(conversation.user_id);
    
    // Then activate this specific conversation
    await conversationService.activateConversation(conversationId);
    
    return res.status(200).json({ message: 'Conversation activated successfully' });
  } catch (error) {
    logger.error('Error activating conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Deactivate all active conversations for a user
conversationsRouter.post('/user/:userId/deactivate', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'Missing required parameter: userId' });
    }
    
    await conversationService.deactivateUserConversations(userId);
    
    return res.status(200).json({ message: 'All conversations deactivated successfully' });
  } catch (error) {
    logger.error('Error deactivating conversations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get the active conversation for a user
conversationsRouter.get('/user/:userId/active', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'Missing required parameter: userId' });
    }
    
    const conversation = await conversationService.getActiveConversation(userId);
    
    return res.status(200).json({ conversation });
  } catch (error) {
    logger.error('Error getting active conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all conversations for a user
conversationsRouter.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const cursor = req.query.cursor as string | undefined;
    
    if (!userId) {
      return res.status(400).json({ message: 'Missing required parameter: userId' });
    }
    
    const conversations = await conversationService.getConversations(userId, limit, cursor);
    
    return res.status(200).json(conversations);
  } catch (error) {
    logger.error('Error getting conversations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a single conversation by ID
conversationsRouter.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      return res.status(400).json({ message: 'Missing required parameter: conversationId' });
    }
    
    const conversation = await conversationService.getConversationById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    return res.status(200).json(conversation);
  } catch (error) {
    logger.error('Error getting conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a conversation
conversationsRouter.delete('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      return res.status(400).json({ message: 'Missing required parameter: conversationId' });
    }
    
    const success = await conversationService.deleteConversation(conversationId);
    
    if (!success) {
      return res.status(404).json({ message: 'Conversation not found or could not be deleted' });
    }
    
    return res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    logger.error('Error deleting conversation:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete all conversations for a user
conversationsRouter.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'Missing required parameter: userId' });
    }
    
    const success = await conversationService.deleteAllConversations(userId);
    
    if (!success) {
      return res.status(500).json({ message: 'Could not delete conversations' });
    }
    
    return res.status(200).json({ message: 'All conversations deleted successfully' });
  } catch (error) {
    logger.error('Error deleting conversations:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
