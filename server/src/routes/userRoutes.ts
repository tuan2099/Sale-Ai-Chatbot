import express from 'express';
import { getProfile, updateProfile, changePassword, uploadAvatar } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/me', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);
router.post('/avatar', authenticateToken, upload.single('avatar'), uploadAvatar);

// Admin Routes
import { getAllUsers, updateUserPlan } from '../controllers/userController';
router.get('/admin/users', authenticateToken, getAllUsers);
router.post('/admin/plan', authenticateToken, updateUserPlan);

export default router;

