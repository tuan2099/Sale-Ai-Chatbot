import express from 'express';
import { createPayment, handleSepayWebhook, getTransactionHistory } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticateToken, createPayment);
router.post('/webhook', handleSepayWebhook); // Public endpoint for Sepay
router.get('/history', authenticateToken, getTransactionHistory);

export default router;
