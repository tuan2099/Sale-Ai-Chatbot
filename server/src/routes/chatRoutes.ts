import express from 'express';
import { handleChatMessage } from '../controllers/chatController';

const router = express.Router();

// Public route for widget chat
router.post('/public/:storeId', handleChatMessage);

export default router;
