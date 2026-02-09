import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Get User Profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { accounts: true } // Include linked accounts
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error('Get Profile User error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update User Profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { name, phoneNumber } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { name, phoneNumber },
        });

        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json({ message: 'Profile updated', user: userWithoutPassword });
    } catch (error) {
        console.error('Update Profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Change Password
export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || !user.password) {
            res.status(400).json({ message: 'User not found or no password set (OAuth user)' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error('Change Password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Upload Avatar
export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        // multer-storage-cloudinary adds path property to req.file which is the Cloudinary URL
        const avatarUrl = (req.file as any).path;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { image: avatarUrl },
        });

        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json({ message: 'Avatar uploaded', user: userWithoutPassword });
    } catch (error) {
        console.error('Upload Avatar error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

