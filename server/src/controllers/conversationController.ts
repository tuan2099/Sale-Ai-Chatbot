import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all conversations for a store
export const getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
        const storeId = req.params.storeId as string;
        const search = req.query.search as string;
        const status = req.query.status as string;
        const tag = req.query.tag as string;
        const userId = (req as any).user?.userId;

        // Verify store belongs to user
        const store = await prisma.store.findFirst({
            where: { id: storeId, userId: String(userId) }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        const where: any = { storeId };
        if (status) where.status = status;

        if (search) {
            where.customer = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { phoneNumber: { contains: search, mode: 'insensitive' } },
                ]
            };
        }

        if (tag) {
            where.tags = {
                some: { id: tag }
            };
        }

        const conversations = await (prisma as any).conversation.findMany({
            where,
            include: {
                customer: true,
                tags: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Get Conversations error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get messages for a conversation
export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.userId;

        const conversation = await (prisma as any).conversation.findUnique({
            where: { id },
            include: { store: true }
        });

        if (!conversation || conversation.store.userId !== String(userId)) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        const messages = await (prisma as any).message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'asc' }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Get Messages error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Send agent message
export const sendAgentMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = (req as any).user?.userId;

        const conversation = await (prisma as any).conversation.findUnique({
            where: { id },
            include: { store: true }
        });

        if (!conversation || conversation.store.userId !== String(userId)) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        const message = await (prisma as any).message.create({
            data: {
                conversationId: id,
                role: 'AGENT',
                content
            }
        });

        await (prisma as any).conversation.update({
            where: { id },
            data: {
                lastMessage: content,
                updatedAt: new Date()
            }
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Send Agent Message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update conversation (status, etc.)
export const updateConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, tagIds } = req.body;
        const userId = (req as any).user?.userId;

        const conversation = await (prisma as any).conversation.findUnique({
            where: { id },
            include: { store: true }
        });

        if (!conversation || conversation.store.userId !== String(userId)) {
            res.status(404).json({ message: 'Conversation not found' });
            return;
        }

        const data: any = {};
        if (status) data.status = status;
        if (tagIds) {
            data.tags = {
                set: tagIds.map((tid: string) => ({ id: tid }))
            };
        }

        const updated = await (prisma as any).conversation.update({
            where: { id },
            data,
            include: { tags: true }
        });

        res.status(200).json(updated);
    } catch (error) {
        console.error('Update Conversation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Tag Management
export const getTags = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const tags = await (prisma as any).tag.findMany({
            where: { storeId }
        });
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const { name, color } = req.body;
        const tag = await (prisma as any).tag.create({
            data: { name, color, storeId }
        });
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Note Management
export const getNotes = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.params;
        const notes = await (prisma as any).note.findMany({
            where: { customerId },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addNote = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customerId } = req.params;
        const { content } = req.body;
        const userId = (req as any).user?.userId;

        const note = await (prisma as any).note.create({
            data: {
                content,
                customerId,
                userId: String(userId)
            },
            include: { user: { select: { name: true } } }
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// AI Training & Quality Control
export const submitMessageFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { rating, feedback } = req.body;
        const userId = (req as any).user?.userId;

        // Verify message exists and belongs to a store the user owns
        const message = await (prisma as any).message.findUnique({
            where: { id },
            include: {
                conversation: {
                    include: { store: true }
                }
            }
        });

        if (!message || message.conversation.store.userId !== String(userId)) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }

        const updated = await (prisma as any).message.update({
            where: { id },
            data: { rating, feedback }
        });

        res.status(200).json(updated);
    } catch (error) {
        console.error('Submit Message Feedback error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const submitMessageCorrection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { correctedContent } = req.body;
        const userId = (req as any).user?.userId;

        const message = await (prisma as any).message.findUnique({
            where: { id },
            include: {
                conversation: {
                    include: { store: true }
                }
            }
        });

        if (!message || message.conversation.store.userId !== String(userId)) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }

        const updated = await (prisma as any).message.update({
            where: { id },
            data: { correctedContent }
        });

        res.status(200).json(updated);
    } catch (error) {
        console.error('Submit Message Correction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
