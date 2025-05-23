import { Router } from 'express';
import { PersonalizedChatService } from '../services/personalizedChatService';
import { logger } from '../utils/logger';

export const chatRouter = Router();
const personalizedChatService = PersonalizedChatService.getInstance();

// Get personalized chat response
chatRouter.post('/personalized-query', async (req, res) => {
  try {
    const { userId, query } = req.body;
    
    if (!userId || !query) {
      return res.status(400).json({ message: 'Missing required fields: userId or query' });
    }
    
    const response = await personalizedChatService.getPersonalizedResponse(userId, query);
    
    return res.status(200).json(response);
  } catch (error) {
    logger.error('Error getting personalized response:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get streaming personalized chat response
chatRouter.post('/personalized-query/stream', async (req, res) => {
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
      const { stream, context } = await personalizedChatService.getPersonalizedResponseStream(userId, query);
      
      // Send personalization context first
      res.write(`data: ${JSON.stringify({ type: 'context', data: context })}\n\n`);
      
      // Stream the response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ type: 'content', data: content })}\n\n`);
        }
      }
      
      // End the stream
      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      res.end();
    } catch (error) {
      res.write(`data: ${JSON.stringify({ type: 'error', data: 'Error generating response' })}\n\n`);
      res.end();
    }
  } catch (error) {
    logger.error('Error in streaming personalized response:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
