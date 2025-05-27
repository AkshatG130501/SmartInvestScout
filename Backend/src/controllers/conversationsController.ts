import { Request, Response } from 'express';
import { ConversationService } from '../services/conversationService';
import { logger } from '../utils/logger';

export class ConversationsController {
  private static instance: ConversationsController;
  private conversationService: ConversationService;

  private constructor() {
    this.conversationService = ConversationService.getInstance();
  }

  public static getInstance(): ConversationsController {
    if (!ConversationsController.instance) {
      ConversationsController.instance = new ConversationsController();
    }
    return ConversationsController.instance;
  }

  public async createConversation(req: Request, res: Response) {
    try {
      const { userId, title, message, response, personalizationContext } = req.body;

      if (!userId || !message || !response) {
        return res
          .status(400)
          .json({ message: 'Missing required fields: userId, message, or response' });
      }

      const conversation = await this.conversationService.createConversation({
        userId,
        title: title || '',
        message,
        response,
        personalizationContext,
      });

      return res.status(201).json(conversation);
    } catch (error) {
      logger.error('Error creating conversation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async addMessageToConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { message, response, personalizationContext } = req.body;

      if (!conversationId || !message || !response) {
        return res
          .status(400)
          .json({ message: 'Missing required fields: conversationId, message, or response' });
      }

      const updatedConversation = await this.conversationService.addMessageToConversation({
        conversationId,
        message,
        response,
        personalizationContext,
      });

      return res.status(200).json(updatedConversation);
    } catch (error) {
      logger.error('Error adding message to conversation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async activateConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ message: 'Missing required parameter: conversationId' });
      }

      // Get the conversation to check if it exists and get the user ID
      const conversation = await this.conversationService.getConversationById(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      // First deactivate all conversations for this user
      await this.conversationService.deactivateUserConversations(conversation.user_id);

      // Then activate this specific conversation
      await this.conversationService.activateConversation(conversationId);

      return res.status(200).json({ message: 'Conversation activated successfully' });
    } catch (error) {
      logger.error('Error activating conversation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async deactivateUserConversations(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: 'Missing required parameter: userId' });
      }

      await this.conversationService.deactivateUserConversations(userId);

      return res.status(200).json({ message: 'All conversations deactivated successfully' });
    } catch (error) {
      logger.error('Error deactivating conversations:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getActiveConversation(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: 'Missing required parameter: userId' });
      }

      const conversation = await this.conversationService.getActiveConversation(userId);

      return res.status(200).json({ conversation });
    } catch (error) {
      logger.error('Error getting active conversation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getConversations(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const cursor = req.query.cursor as string | undefined;

      if (!userId) {
        return res.status(400).json({ message: 'Missing required parameter: userId' });
      }

      const conversations = await this.conversationService.getConversations(userId, limit, cursor);

      return res.status(200).json(conversations);
    } catch (error) {
      logger.error('Error getting conversations:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getConversationById(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ message: 'Missing required parameter: conversationId' });
      }

      const conversation = await this.conversationService.getConversationById(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      return res.status(200).json(conversation);
    } catch (error) {
      logger.error('Error getting conversation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async deleteConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;

      if (!conversationId) {
        return res.status(400).json({ message: 'Missing required parameter: conversationId' });
      }

      const success = await this.conversationService.deleteConversation(conversationId);

      if (!success) {
        return res.status(404).json({ message: 'Conversation not found or could not be deleted' });
      }

      return res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      logger.error('Error deleting conversation:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async deleteAllConversations(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: 'Missing required parameter: userId' });
      }

      const success = await this.conversationService.deleteAllConversations(userId);

      if (!success) {
        return res.status(500).json({ message: 'Could not delete conversations' });
      }

      return res.status(200).json({ message: 'All conversations deleted successfully' });
    } catch (error) {
      logger.error('Error deleting conversations:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
