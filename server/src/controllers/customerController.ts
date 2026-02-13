import { Request, Response } from 'express';
import { PrismaClient, Gender } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

// Get All Customers for a User
export const getCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { q, gender, channel, page = 1, limit = 10 } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {
            userId,
            AND: []
        };

        if (q) {
            where.AND.push({
                OR: [
                    { name: { contains: String(q), mode: 'insensitive' } },
                    { email: { contains: String(q), mode: 'insensitive' } },
                    { phoneNumber: { contains: String(q), mode: 'insensitive' } },
                ]
            });
        }

        if (gender) {
            where.AND.push({ gender: String(gender) as Gender });
        }

        if (channel) {
            where.AND.push({ channel: String(channel) });
        }

        if (req.query.storeId) {
            where.AND.push({ storeId: String(req.query.storeId) });
        }

        if (where.AND.length === 0) delete where.AND;

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take,
                orderBy: { lastInteraction: 'desc' }
            }),
            prisma.customer.count({ where })
        ]);

        res.status(200).json({
            customers,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        console.error('Get Customers error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create Customer
export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { name, email, phoneNumber, gender, channel, image, storeId } = req.body;

        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }

        const customer = await prisma.customer.create({
            data: {
                name: String(name),
                email: email ? String(email) : undefined,
                phoneNumber: phoneNumber ? String(phoneNumber) : undefined,
                gender: gender ? (String(gender) as Gender) : undefined,
                channel: channel ? String(channel) : "Website",
                image: image ? String(image) : undefined,
                userId: String(userId),
                storeId: storeId ? String(storeId) : undefined
            }
        });

        res.status(201).json(customer);
    } catch (error) {
        console.error('Create Customer error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update Customer
export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const data = req.body;

        const customer = await prisma.customer.findFirst({
            where: { id: String(id), userId: String(userId) }
        });

        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }

        const updatedCustomer = await prisma.customer.update({
            where: { id: String(id) },
            data: {
                name: data.name ? String(data.name) : undefined,
                email: data.email !== undefined ? String(data.email) : undefined,
                phoneNumber: data.phoneNumber !== undefined ? String(data.phoneNumber) : undefined,
                gender: data.gender ? (String(data.gender) as Gender) : undefined,
                channel: data.channel ? String(data.channel) : undefined,
                image: data.image !== undefined ? String(data.image) : undefined,
                lastInteraction: data.lastInteraction ? new Date(data.lastInteraction) : undefined
            }
        });

        res.status(200).json(updatedCustomer);
    } catch (error) {
        console.error('Update Customer error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete Customer
export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const customer = await prisma.customer.findFirst({
            where: { id: String(id), userId: String(userId) }
        });

        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }

        await prisma.customer.delete({
            where: { id: String(id) }
        });

        res.status(200).json({ message: 'Customer deleted' });
    } catch (error) {
        console.error('Delete Customer error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
