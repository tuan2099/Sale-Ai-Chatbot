import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Workaround for prisma types if generate fails
const KnowledgeType = {
    WEBSITE: 'WEBSITE',
    FILE: 'FILE',
    MANUAL: 'MANUAL'
};

const KnowledgeStatus = {
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
};

// Get all knowledge items for a store
export const getKnowledgeItems = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const userId = req.user?.userId;

        // Verify store belongs to user
        const store = await prisma.store.findFirst({
            where: { id: String(storeId), userId: String(userId) }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        const items = await (prisma as any).knowledge.findMany({
            where: { storeId: String(storeId) },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(items);
    } catch (error) {
        console.error('Get Knowledge Items error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add manual (text) knowledge
export const addManualKnowledge = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const { name, content } = req.body;
        const userId = req.user?.userId;

        if (!name || !content) {
            res.status(400).json({ message: 'Name and content are required' });
            return;
        }

        // Verify store belongs to user
        const store = await prisma.store.findFirst({
            where: { id: String(storeId), userId: String(userId) }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        const item = await (prisma as any).knowledge.create({
            data: {
                name: String(name),
                content: String(content),
                type: KnowledgeType.MANUAL,
                status: KnowledgeStatus.COMPLETED,
                storeId: String(storeId)
            }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Add Manual Knowledge error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add website knowledge (Scraping)
export const addWebsiteKnowledge = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const { name, url } = req.body;
        const userId = req.user?.userId;

        if (!name || !url) {
            res.status(400).json({ message: 'Name and URL are required' });
            return;
        }

        // Verify store belongs to user
        const store = await prisma.store.findFirst({
            where: { id: String(storeId), userId: String(userId) }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        // Basic Fetching (Node 18+)
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            res.status(400).json({ message: 'Could not fetch URL' });
            return;
        }

        const html = await response.text();
        const cheerio = require('cheerio');
        const $ = cheerio.load(html);

        // Remove scripts, styles, and other unnecessary elements
        $('script').remove();
        $('style').remove();
        $('noscript').remove();
        $('iframe').remove();
        $('nav').remove(); // Optional: remove navigation
        $('footer').remove(); // Optional: remove footer

        // Extract text from body
        const content = $('body').text().replace(/\s+/g, ' ').trim();

        if (!content || content.length < 50) {
            res.status(400).json({ message: 'Website content is too short or empty' });
            return;
        }

        const item = await (prisma as any).knowledge.create({
            data: {
                name: String(name),
                content: content,
                url: String(url),
                type: KnowledgeType.WEBSITE,
                status: KnowledgeStatus.COMPLETED,
                storeId: String(storeId)
            }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Add Website Knowledge error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add file knowledge
export const addFileKnowledge = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { storeId } = req.params;
        const { name } = req.body;
        const userId = req.user?.userId;
        const file = req.file;

        if (!name || !file) {
            res.status(400).json({ message: 'Name and File are required' });
            return;
        }

        // Verify store belongs to user
        const store = await prisma.store.findFirst({
            where: { id: String(storeId), userId: String(userId) }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        const item = await (prisma as any).knowledge.create({
            data: {
                name: String(name),
                fileUrl: (file as any).path, // Cloudinary URL
                type: KnowledgeType.FILE,
                status: KnowledgeStatus.COMPLETED,
                storeId: String(storeId),
                metadata: {
                    filename: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size
                }
            }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Add File Knowledge error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete knowledge item
export const deleteKnowledgeItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { storeId, id } = req.params;
        const userId = req.user?.userId;

        // Verify store belongs to user
        const store = await prisma.store.findFirst({
            where: { id: String(storeId), userId: String(userId) }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        await (prisma as any).knowledge.delete({
            where: { id: String(id), storeId: String(storeId) }
        });

        res.status(200).json({ message: 'Knowledge item deleted' });
    } catch (error) {
        console.error('Delete Knowledge Item error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
