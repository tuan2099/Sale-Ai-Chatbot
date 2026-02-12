import express from 'express';
import { handleFacebookEvent, handleZaloEvent, verifyFacebookWebhook } from '../controllers/webhookController';

const router = express.Router();

// Facebook Webhook
router.get('/facebook', verifyFacebookWebhook); // Verification
router.post('/facebook', handleFacebookEvent);  // Events

// Zalo Webhook
router.post('/zalo', handleZaloEvent);

export default router;
