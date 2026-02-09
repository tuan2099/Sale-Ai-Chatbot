import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
    getConversations,
    getMessages,
    sendAgentMessage,
    updateConversation,
    getTags,
    createTag,
    getNotes,
    addNote,
    submitMessageFeedback,
    submitMessageCorrection
} from '../controllers/conversationController';

const router = express.Router();

// Conversation Routes
router.get('/:storeId', authenticateToken, getConversations);
router.get('/messages/:id', authenticateToken, getMessages);
router.post('/messages/:id', authenticateToken, sendAgentMessage);
router.patch('/messages/:id/feedback', authenticateToken, submitMessageFeedback);
router.patch('/messages/:id/correction', authenticateToken, submitMessageCorrection);
router.patch('/:id', authenticateToken, updateConversation);

// Tag Routes
router.get('/tags/:storeId', authenticateToken, getTags);
router.post('/tags/:storeId', authenticateToken, createTag);

// Note Routes
router.get('/notes/:customerId', authenticateToken, getNotes);
router.post('/notes/:customerId', authenticateToken, addNote);

export default router;
