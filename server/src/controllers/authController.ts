import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name, phoneNumber } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ message: 'Name, email and password are required' });
            return;
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phoneNumber,
            },
        });

        res.status(201).json({ message: 'User created successfully', userId: user.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );


        res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Check for user existence but don't reveal it to prevent enumeration attacks
            // In a real app, maybe delay response slightly or just return 200
            res.status(200).json({ message: 'If account exists, email sent' });
            return;
        }

        // Generate a random token (for now, simply use JWT or random string)
        const resetToken = jwt.sign(
            { userId: user.id, type: 'reset' },
            process.env.JWT_SECRET as string,
            { expiresIn: '15m' }
        );

        // MOCK EMAIL SENDING
        console.log(`[MOCK EMAIL] Password Reset Link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`);

        res.status(200).json({ message: 'Email sent' });
    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required' });
            return;
        }

        // Verify token
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        } catch (err) {
            res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
            return;
        }

        if (decoded.type !== 'reset') {
            res.status(400).json({ message: 'Loại token không hợp lệ' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: decoded.userId },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

