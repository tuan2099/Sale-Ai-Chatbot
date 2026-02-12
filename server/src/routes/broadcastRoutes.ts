import express from 'express';
import { createBroadcast, getBroadcasts } from '../controllers/broadcastController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:storeId', authenticateToken, getBroadcasts);
router.post('/:storeId', authenticateToken, createBroadcast);

export default router;
