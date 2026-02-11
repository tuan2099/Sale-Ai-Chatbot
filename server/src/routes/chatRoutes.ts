import express from 'express';
import { handleChatMessage, getPublicMessages } from '../controllers/chatController';

const router = express.Router();

// Public route for widget chat
router.post('/public/:storeId', handleChatMessage);
router.get('/public/messages/:conversationId', getPublicMessages);

export default router;
