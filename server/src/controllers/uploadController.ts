import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import cloudinary from '../config/cloudinary';

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        // The file is already uploaded to Cloudinary by multer-storage-cloudinary if configured
        // Or we can manually upload it if we just use multer memory storage
        // Given 'multer-storage-cloudinary' is in package.json, I'll assume it's used with multer.

        // If using multer-storage-cloudinary, req.file.path will be the Cloudinary URL
        const imageUrl = (req.file as any).path;

        res.status(200).json({
            message: 'Upload successful',
            url: imageUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
