import express from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customerController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', authenticateToken, getCustomers);
router.post('/', authenticateToken, createCustomer);
router.put('/:id', authenticateToken, updateCustomer);
router.delete('/:id', authenticateToken, deleteCustomer);

export default router;
