import express from 'express';
import { handleChatMessage, getPublicMessages, submitLeadForm } from '../controllers/chatController';

const router = express.Router();

// Public route for widget chat
router.post('/public/:storeId', handleChatMessage);
router.post('/public/lead/:storeId', submitLeadForm);
router.get('/public/messages/:conversationId', getPublicMessages);

export default router;
