import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Get All Stores for a User
export const getStores = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { q, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {
            OR: [
                { userId: String(userId) },
                { members: { some: { userId: String(userId) } } }
            ]
        };

        if (q) {
            where.OR = [
                { name: { contains: String(q), mode: 'insensitive' } },
                { description: { contains: String(q), mode: 'insensitive' } },
            ];
        }

        const [stores, total] = await Promise.all([
            (prisma.store as any).findMany({
                where,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { customers: true }
                    }
                }
            }),
            (prisma.store as any).count({ where })
        ]);

        res.status(200).json({
            stores,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get Stores error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Single Store by ID
export const getStoreById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const store = await (prisma.store as any).findFirst({
            where: {
                id: String(id),
                OR: [
                    { userId: String(userId) },
                    { members: { some: { userId: String(userId) } } }
                ]
            },
            include: {
                _count: {
                    select: { customers: true }
                }
            }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        res.status(200).json(store);
    } catch (error) {
        console.error('Get Store By ID error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create Store
export const createStore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const {
            name,
            description,
            image,
            aiName,
            aiDescription,
            aiPriorityInstructions,
            aiIdentity,
            aiRequirements,
            aiExceptions,
            aiStyle,
            widgetColor,
            widgetImage,
            widgetFont,
            widgetWelcomeMsg,
            widgetSuggestions,
            widgetWelcomeSuggestions,
            widgetLeadFields
        } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }

        const store = await prisma.store.create({
            data: {
                name: String(name),
                description: description ? String(description) : undefined,
                image: image ? String(image) : undefined,
                aiName: aiName ? String(aiName) : "AI Assistant",
                aiDescription: aiDescription ? String(aiDescription) : undefined,
                aiPriorityInstructions: aiPriorityInstructions ? String(aiPriorityInstructions) : undefined,
                aiIdentity: aiIdentity ? String(aiIdentity) : undefined,
                aiRequirements: aiRequirements ? String(aiRequirements) : undefined,
                aiExceptions: aiExceptions ? String(aiExceptions) : undefined,
                aiStyle: aiStyle ? String(aiStyle) : undefined,
                widgetColor: widgetColor ? String(widgetColor) : undefined,
                widgetImage: widgetImage ? String(widgetImage) : undefined,
                widgetFont: widgetFont ? String(widgetFont) : undefined,
                widgetWelcomeMsg: widgetWelcomeMsg ? String(widgetWelcomeMsg) : undefined,
                widgetSuggestions: widgetSuggestions ? String(widgetSuggestions) : undefined,
                widgetWelcomeSuggestions: widgetWelcomeSuggestions ? String(widgetWelcomeSuggestions) : undefined,
                widgetLeadFields: widgetLeadFields ? String(widgetLeadFields) : undefined,
                userId: String(userId)
            }
        });

        res.status(201).json(store);
    } catch (error) {
        console.error('Create Store error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Store
export const updateStore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const data = req.body;

        const store = await (prisma.store as any).findFirst({
            where: {
                id: String(id),
                OR: [
                    { userId: String(userId) },
                    { members: { some: { userId: String(userId), role: 'ADMIN' } } }
                ]
            }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        const updatedStore = await prisma.store.update({
            where: { id: String(id) },
            data: {
                name: data.name ? String(data.name) : undefined,
                description: data.description !== undefined ? String(data.description) : undefined,
                image: data.image !== undefined ? String(data.image) : undefined,
                aiName: data.aiName ? String(data.aiName) : undefined,
                aiDescription: data.aiDescription !== undefined ? String(data.aiDescription) : undefined,
                aiPriorityInstructions: data.aiPriorityInstructions !== undefined ? String(data.aiPriorityInstructions) : undefined,
                aiIdentity: data.aiIdentity !== undefined ? String(data.aiIdentity) : undefined,
                aiRequirements: data.aiRequirements !== undefined ? String(data.aiRequirements) : undefined,
                aiExceptions: data.aiExceptions !== undefined ? String(data.aiExceptions) : undefined,
                aiStyle: data.aiStyle !== undefined ? String(data.aiStyle) : undefined,
                widgetColor: data.widgetColor !== undefined ? String(data.widgetColor) : undefined,
                widgetImage: data.widgetImage !== undefined ? String(data.widgetImage) : undefined,
                widgetFont: data.widgetFont !== undefined ? String(data.widgetFont) : undefined,
                widgetWelcomeMsg: data.widgetWelcomeMsg !== undefined ? String(data.widgetWelcomeMsg) : undefined,
                widgetSuggestions: data.widgetSuggestions !== undefined ? String(data.widgetSuggestions) : undefined,
                widgetWelcomeSuggestions: data.widgetWelcomeSuggestions !== undefined ? String(data.widgetWelcomeSuggestions) : undefined,
                widgetLeadFields: data.widgetLeadFields !== undefined ? String(data.widgetLeadFields) : undefined,

                // Omni-channel Config
                fbPageId: data.fbPageId !== undefined ? String(data.fbPageId) : undefined,
                fbAccessToken: data.fbAccessToken !== undefined ? String(data.fbAccessToken) : undefined,
                zaloOaId: data.zaloOaId !== undefined ? String(data.zaloOaId) : undefined,
                zaloAccessToken: data.zaloAccessToken !== undefined ? String(data.zaloAccessToken) : undefined,
            }
        });

        res.status(200).json(updatedStore);
    } catch (error) {
        console.error('Update Store error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Store
export const deleteStore = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const store = await prisma.store.findFirst({
            where: { id: String(id), userId: String(userId) }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        await prisma.store.delete({
            where: { id: String(id) }
        });

        res.status(200).json({ message: 'Store deleted' });
    } catch (error) {
        console.error('Delete Store error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPublicStoreConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const store = await prisma.store.findUnique({
            where: { id: String(id) },
            select: {
                id: true,
                name: true,
                aiName: true,
                aiIdentity: true,
                aiStyle: true,
                widgetColor: true,
                widgetImage: true,
                widgetFont: true,
                widgetWelcomeMsg: true,
                widgetSuggestions: true,
                widgetWelcomeSuggestions: true,
                widgetLeadFields: true,
            }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        res.status(200).json(store);
    } catch (error) {
        console.error('Get Public Store Config error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getStoreStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        // Verify store belongs to user or as a member
        const store = await (prisma.store as any).findFirst({
            where: {
                id: String(id),
                OR: [
                    { userId: String(userId) },
                    { members: { some: { userId: String(userId) } } }
                ]
            }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        // 1. Basic totals
        const [customerCount, conversationCount, messageCount] = await Promise.all([
            prisma.customer.count({ where: { storeId: String(id) } }),
            prisma.conversation.count({ where: { storeId: String(id) } }),
            prisma.message.count({ where: { conversation: { storeId: String(id) } } }),
        ]);

        // 2. Trend data (Last 14 days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        fourteenDaysAgo.setHours(0, 0, 0, 0);

        const conversations = await prisma.conversation.findMany({
            where: {
                storeId: String(id),
                createdAt: { gte: fourteenDaysAgo }
            },
            select: { createdAt: true }
        });

        const messages = await prisma.message.findMany({
            where: {
                conversation: { storeId: String(id) },
                createdAt: { gte: fourteenDaysAgo }
            },
            select: { createdAt: true }
        });

        const customers = await prisma.customer.findMany({
            where: {
                storeId: String(id),
                createdAt: { gte: fourteenDaysAgo }
            },
            select: { createdAt: true }
        });

        // 3. Group by day
        const statsMap: Record<string, { date: string, conversations: number, messages: number, customers: number }> = {};

        // Initialize last 14 days
        for (let i = 0; i < 14; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            statsMap[dateStr] = { date: dateStr, conversations: 0, messages: 0, customers: 0 };
        }

        conversations.forEach(c => {
            const dateStr = c.createdAt.toISOString().split('T')[0];
            if (statsMap[dateStr]) statsMap[dateStr].conversations++;
        });

        messages.forEach(m => {
            const dateStr = m.createdAt.toISOString().split('T')[0];
            if (statsMap[dateStr]) statsMap[dateStr].messages++;
        });

        customers.forEach(c => {
            const dateStr = c.createdAt.toISOString().split('T')[0];
            if (statsMap[dateStr]) statsMap[dateStr].customers++;
        });

        const trend = Object.values(statsMap).sort((a, b) => a.date.localeCompare(b.date));

        res.status(200).json({
            totals: {
                customers: customerCount,
                conversations: conversationCount,
                messages: messageCount,
            },
            trend
        });
    } catch (error) {
        console.error('Get Store Stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
