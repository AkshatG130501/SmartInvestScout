import { Router } from 'express';
import { ChatController } from '../controllers/chatController';

const router = Router();
const chatController = ChatController.getInstance();

// Get personalized chat response
router.post('/personalized-query', chatController.getPersonalizedResponse.bind(chatController));

// Get streaming personalized chat response
router.post(
  '/personalized-query/stream',
  chatController.getStreamingPersonalizedResponse.bind(chatController)
);

// Save chat message to history
router.post('/history', chatController.saveChatMessage.bind(chatController));

// Get chat history for a user
router.get('/history/:userId', chatController.getChatHistory.bind(chatController));

// Delete a chat message
router.delete('/history/:messageId', chatController.deleteChatMessage.bind(chatController));

// Delete all chat history for a user
router.delete('/history/user/:userId', chatController.deleteAllChatHistory.bind(chatController));

export default router;
