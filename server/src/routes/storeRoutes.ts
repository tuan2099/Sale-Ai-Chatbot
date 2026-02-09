import express from 'express';
import { getStores, getStoreById, createStore, updateStore, deleteStore, getPublicStoreConfig, getStoreStats } from '../controllers/storeController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (for chat widget)
router.get('/public/:id', getPublicStoreConfig);

// Protected routes
router.get('/', authenticateToken, getStores);
router.get('/:id', authenticateToken, getStoreById);
router.get('/:id/stats', authenticateToken, getStoreStats);
router.post('/', authenticateToken, createStore);
router.put('/:id', authenticateToken, updateStore);
router.delete('/:id', authenticateToken, deleteStore);

export default router;
