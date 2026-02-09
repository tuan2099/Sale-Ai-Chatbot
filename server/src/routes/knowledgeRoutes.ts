import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {
    getKnowledgeItems,
    addManualKnowledge,
    addWebsiteKnowledge,
    addFileKnowledge,
    deleteKnowledgeItem
} from '../controllers/knowledgeController';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'sale-chatbot-docs',
        resource_type: 'auto', // Support non-image files
    } as any,
});

const upload = multer({ storage });
const router = express.Router();

// All routes are protected and require store context
router.get('/:storeId', authenticateToken, getKnowledgeItems);
router.post('/:storeId/manual', authenticateToken, addManualKnowledge);
router.post('/:storeId/website', authenticateToken, addWebsiteKnowledge);
router.post('/:storeId/file', authenticateToken, upload.single('file'), addFileKnowledge);
router.delete('/:storeId/:id', authenticateToken, deleteKnowledgeItem);

export default router;
