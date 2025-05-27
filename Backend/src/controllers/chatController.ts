import { Request, Response } from 'express';
import { PersonalizedChatService } from '../services/personalizedChatService';
import { ChatHistoryService } from '../services/chatHistoryService';
import { ConversationService } from '../services/conversationService';
import { logger } from '../utils/logger';

export class ChatController {
  private static instance: ChatController;
  private personalizedChatService: PersonalizedChatService;
  private chatHistoryService: ChatHistoryService;
  private conversationService: ConversationService;

  private constructor() {
    this.personalizedChatService = PersonalizedChatService.getInstance();
    this.chatHistoryService = ChatHistoryService.getInstance();
    this.conversationService = ConversationService.getInstance();
  }

  public static getInstance(): ChatController {
    if (!ChatController.instance) {
      ChatController.instance = new ChatController();
    }
    return ChatController.instance;
  }

  public async getPersonalizedResponse(req: Request, res: Response) {
    try {
      const { userId, query, conversationId } = req.body;

      if (!userId || !query) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }

      const response = await this.personalizedChatService.getPersonalizedResponse(userId, query);

      try {
        // If conversationId is provided, use it
        if (conversationId) {
          await this.conversationService.addMessageToConversation({
            conversationId,
            message: query,
            response: response.content,
            personalizationContext: response.personalizationContext,
          });
        } else {
          // No conversationId provided, check if there's an active conversation
          const activeConversation = await this.conversationService.getActiveConversation(userId);

          if (activeConversation) {
            // Add to the active conversation
            await this.conversationService.addMessageToConversation({
              conversationId: activeConversation.id,
              message: query,
              response: response.content,
              personalizationContext: response.personalizationContext,
            });
          } else {
            // No active conversation, create a new one
            await this.conversationService.createConversation({
              userId,
              title: '', // Auto-generated title
              message: query,
              response: response.content,
              personalizationContext: response.personalizationContext,
            });
          }
        }
      } catch (saveError) {
        // Log the error but don't fail the request
        logger.error('Error saving conversation:', saveError);
      }

      return res.status(200).json(response);
    } catch (error) {
      logger.error('Error getting personalized response:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getStreamingPersonalizedResponse(req: Request, res: Response) {
    try {
      const { userId, query } = req.body;

      if (!userId || !query) {
        return res.status(400).json({ message: 'Missing required fields: userId or query' });
      }

      // Set headers for SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const { stream, context } =
          await this.personalizedChatService.getPersonalizedResponseStream(userId, query);

        // Send personalization context first
        res.write(`data: ${JSON.stringify({ type: 'context', data: context })}\n\n`);

        // Collect the full response to save to history
        let fullResponse = '';

        // Stream the response
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ type: 'content', data: content })}\n\n`);
          }
        }

        // Get the active conversation ID from the request, if any
        const { conversationId } = req.body;

        // Save the chat message and response
        try {
          if (conversationId) {
            // Add to existing conversation
            await this.conversationService.addMessageToConversation({
              conversationId,
              message: query,
              response: fullResponse,
              personalizationContext: context,
            });
          } else {
            // Create a new conversation
            await this.conversationService.createConversation({
              userId,
              title: '', // Will be auto-generated
              message: query,
              response: fullResponse,
              personalizationContext: context,
            });
          }
        } catch (saveError) {
          // Log the error but don't fail the request
          logger.error('Error saving conversation for stream:', saveError);
        }

        // End the stream
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      } catch (error) {
        res.write(
          `data: ${JSON.stringify({ type: 'error', data: 'Error generating response' })}\n\n`
        );
        res.end();
      }
    } catch (error) {
      logger.error('Error in streaming personalized response:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async saveChatMessage(req: Request, res: Response) {
    try {
      const { userId, message, response, personalizationContext } = req.body;

      if (!userId || !message || !response) {
        return res
          .status(400)
          .json({ message: 'Missing required fields: userId, message, or response' });
      }

      const savedMessage = await this.chatHistoryService.saveChatMessage(
        userId,
        message,
        response,
        personalizationContext
      );

      return res.status(201).json(savedMessage);
    } catch (error) {
      logger.error('Error saving chat message:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async getChatHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const cursor = req.query.cursor as string | undefined;

      if (!userId) {
        return res.status(400).json({ message: 'Missing required parameter: userId' });
      }

      const history = await this.chatHistoryService.getChatHistory(userId, limit, cursor);

      return res.status(200).json(history);
    } catch (error) {
      logger.error('Error getting chat history:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async deleteChatMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;

      if (!messageId) {
        return res.status(400).json({ message: 'Missing required parameter: messageId' });
      }

      const success = await this.chatHistoryService.deleteChatMessage(messageId);

      if (!success) {
        return res.status(404).json({ message: 'Chat message not found or could not be deleted' });
      }

      return res.status(200).json({ message: 'Chat message deleted successfully' });
    } catch (error) {
      logger.error('Error deleting chat message:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  public async deleteAllChatHistory(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: 'Missing required parameter: userId' });
      }

      const success = await this.chatHistoryService.deleteAllChatHistory(userId);

      if (!success) {
        return res.status(500).json({ message: 'Could not delete chat history' });
      }

      return res.status(200).json({ message: 'Chat history deleted successfully' });
    } catch (error) {
      logger.error('Error deleting chat history:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
