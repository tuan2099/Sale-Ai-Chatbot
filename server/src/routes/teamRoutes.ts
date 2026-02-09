import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
    getStoreMembers,
    addStoreMember,
    updateMemberRole,
    removeStoreMember
} from '../controllers/teamController';

const router = express.Router();

router.get('/:id/members', authenticateToken, getStoreMembers);
router.post('/:id/members', authenticateToken, addStoreMember);
router.patch('/:id/members/:memberId', authenticateToken, updateMemberRole);
router.delete('/:id/members/:memberId', authenticateToken, removeStoreMember);

export default router;
