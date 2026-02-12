import express from 'express';
import { getScripts, createScript, updateScript, deleteScript } from '../controllers/scriptController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/:storeId', authenticateToken, getScripts);
router.post('/:storeId', authenticateToken, createScript);
router.put('/:id', authenticateToken, updateScript);
router.delete('/:id', authenticateToken, deleteScript);

export default router;
