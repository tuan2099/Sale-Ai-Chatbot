import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all scripts for a store
export const getScripts = async (req: Request, res: Response): Promise<void> => {
    try {
        const storeId = req.params.storeId as string;
        const scripts = await prisma.script.findMany({
            where: { storeId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(scripts);
    } catch (error) {
        console.error('Get Scripts error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create a new script
export const createScript = async (req: Request, res: Response): Promise<void> => {
    try {
        const storeId = req.params.storeId as string;
        const { keyword, response, isActive } = req.body;

        if (!keyword || !response) {
            res.status(400).json({ message: 'Keyword and response are required' });
            return;
        }

        const script = await prisma.script.create({
            data: {
                storeId,
                keyword,
                response,
                isActive: isActive ?? true
            }
        });
        res.status(201).json(script);
    } catch (error) {
        console.error('Create Script error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update a script
export const updateScript = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { keyword, response, isActive } = req.body;

        const script = await prisma.script.update({
            where: { id },
            data: {
                keyword,
                response,
                isActive
            }
        });
        res.status(200).json(script);
    } catch (error) {
        console.error('Update Script error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete a script
export const deleteScript = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await prisma.script.delete({
            where: { id }
        });
        res.status(200).json({ message: 'Script deleted successfully' });
    } catch (error) {
        console.error('Delete Script error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
