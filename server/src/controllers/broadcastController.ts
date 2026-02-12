import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new broadcast (Send to all customers)
export const createBroadcast = async (req: Request, res: Response): Promise<void> => {
    try {
        const storeId = req.params.storeId as string;
        const { name, content } = req.body;

        if (!name || !content) {
            res.status(400).json({ message: 'Name and content are required' });
            return;
        }

        // 1. Find all active conversations for the store
        // We target conversations where we have interacted before
        const conversations = await prisma.conversation.findMany({
            where: { storeId },
            include: { customer: true }
        });

        if (conversations.length === 0) {
            res.status(400).json({ message: 'No customers found to broadcast to.' });
            return;
        }

        // 2. Send messages (Create Message records)
        // In a real production app, this should be a background job / queue
        let sentCount = 0;
        const promises = conversations.map(async (conv) => {
            try {
                await prisma.message.create({
                    data: {
                        conversationId: conv.id,
                        role: 'AGENT', // Or maybe a new role 'BROADCAST'? Let's use AGENT for now so user sees it.
                        content: `[Tin nhắn hệ thống]: ${content}`
                    }
                });

                // Update conversation last message
                await prisma.conversation.update({
                    where: { id: conv.id },
                    data: {
                        lastMessage: `[Tin nhắn hệ thống]: ${content}`,
                        updatedAt: new Date()
                    }
                });
                sentCount++;
            } catch (err) {
                console.error(`Failed to send to conv ${conv.id}`, err);
            }
        });

        await Promise.all(promises);

        // 3. Create Broadcast record
        const broadcast = await prisma.broadcast.create({
            data: {
                storeId,
                name,
                content,
                recipientCount: sentCount
            }
        });

        res.status(201).json(broadcast);
    } catch (error) {
        console.error('Create Broadcast error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get broadcast history
export const getBroadcasts = async (req: Request, res: Response): Promise<void> => {
    try {
        const storeId = req.params.storeId as string;
        const broadcasts = await prisma.broadcast.findMany({
            where: { storeId },
            orderBy: { sentAt: 'desc' }
        });
        res.status(200).json(broadcasts);
    } catch (error) {
        console.error('Get Broadcasts error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
