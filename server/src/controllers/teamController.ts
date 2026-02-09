import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Local definition since Prisma client generation might fail on Windows while running
enum StoreRole {
    ADMIN = 'ADMIN',
    AGENT = 'AGENT'
}

// Get all members of a store
export const getStoreMembers = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = (req as any).user?.userId;

        // Verify requesting user is a member/owner of the store
        const store = await (prisma as any).store.findFirst({
            where: {
                id,
                OR: [
                    { userId: String(userId) },
                    { members: { some: { userId: String(userId) } } }
                ]
            }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found or access denied' });
            return;
        }

        const members = await (prisma as any).storeMember.findMany({
            where: { storeId: id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: { joinedAt: 'asc' }
        });

        res.status(200).json(members);
    } catch (error) {
        console.error('Get store members error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Add a member to a store by email
export const addStoreMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { email, role } = req.body;
        const userId = (req as any).user?.userId;

        // Only store owner or ADMIN members can add others
        const store = await (prisma as any).store.findFirst({
            where: {
                id,
                OR: [
                    { userId: String(userId) },
                    { members: { some: { userId: String(userId), role: StoreRole.ADMIN } } }
                ]
            }
        });

        if (!store) {
            res.status(403).json({ message: 'Permission denied' });
            return;
        }

        // Find user by email
        const userToAdd = await (prisma as any).user.findUnique({
            where: { email }
        });

        if (!userToAdd) {
            res.status(404).json({ message: 'User not found with this email' });
            return;
        }

        // Check if already a member
        const existingMember = await (prisma as any).storeMember.findUnique({
            where: {
                storeId_userId: {
                    storeId: id,
                    userId: userToAdd.id
                }
            }
        });

        if (existingMember) {
            res.status(400).json({ message: 'User is already a member of this store' });
            return;
        }

        const newMember = await (prisma as any).storeMember.create({
            data: {
                storeId: id,
                userId: userToAdd.id,
                role: role || StoreRole.AGENT
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });

        res.status(201).json(newMember);
    } catch (error) {
        console.error('Add store member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update member role
export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, memberId } = req.params;
        const { role } = req.body;
        const userId = (req as any).user?.userId;

        // Verify permission (Owner or ADMIN)
        const store = await (prisma as any).store.findFirst({
            where: {
                id,
                OR: [
                    { userId: String(userId) },
                    { members: { some: { userId: String(userId), role: StoreRole.ADMIN } } }
                ]
            }
        });

        if (!store) {
            res.status(403).json({ message: 'Permission denied' });
            return;
        }

        const updated = await (prisma as any).storeMember.update({
            where: { id: memberId },
            data: { role: role },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        res.status(200).json(updated);
    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Remove member from store
export const removeStoreMember = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, memberId } = req.params;
        const userId = (req as any).user?.userId;

        // Verify permission
        const store = await (prisma as any).store.findFirst({
            where: {
                id,
                OR: [
                    { userId: String(userId) },
                    { members: { some: { userId: String(userId), role: StoreRole.ADMIN } } }
                ]
            }
        });

        if (!store) {
            res.status(403).json({ message: 'Permission denied' });
            return;
        }

        await (prisma as any).storeMember.delete({
            where: { id: memberId }
        });

        res.status(200).json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
