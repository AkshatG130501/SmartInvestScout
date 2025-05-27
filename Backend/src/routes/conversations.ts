import { Router } from 'express';
import { ConversationsController } from '../controllers/conversationsController';

const router = Router();
const conversationsController = ConversationsController.getInstance();

// Create a new conversation
router.post('/', conversationsController.createConversation.bind(conversationsController));

// Add a message to an existing conversation
router.post(
  '/:conversationId/messages',
  conversationsController.addMessageToConversation.bind(conversationsController)
);

// Activate a specific conversation
router.post(
  '/:conversationId/activate',
  conversationsController.activateConversation.bind(conversationsController)
);

// Deactivate all active conversations for a user
router.post(
  '/user/:userId/deactivate',
  conversationsController.deactivateUserConversations.bind(conversationsController)
);

// Get the active conversation for a user
router.get(
  '/user/:userId/active',
  conversationsController.getActiveConversation.bind(conversationsController)
);

// Get all conversations for a user
router.get('/user/:userId', conversationsController.getConversations.bind(conversationsController));

// Get a single conversation by ID
router.get(
  '/:conversationId',
  conversationsController.getConversationById.bind(conversationsController)
);

// Delete a conversation
router.delete(
  '/:conversationId',
  conversationsController.deleteConversation.bind(conversationsController)
);

// Delete all conversations for a user
router.delete(
  '/user/:userId',
  conversationsController.deleteAllConversations.bind(conversationsController)
);

export default router;
