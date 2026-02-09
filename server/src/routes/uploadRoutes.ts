import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { authenticateToken } from '../middleware/authMiddleware';
import { uploadImage } from '../controllers/uploadController';
import cloudinary from '../config/cloudinary';

const router = express.Router();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'sale-chatbot',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
    } as any,
});

const upload = multer({ storage: storage });

router.post('/', authenticateToken, upload.single('image'), uploadImage);

export default router;
