import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { SubscriptionService } from '../services/subscriptionService';
import { PlanType } from '../config/plans';

const prisma = new PrismaClient();

// Configuration (Env variables)
const SEPAY_ACCOUNT_NUMBER = process.env.SEPAY_ACCOUNT_NUMBER || '0948593362'; // Default to user phone for now
const SEPAY_BANK_PROVIDER = process.env.SEPAY_BANK_PROVIDER || 'MBBank';
const SEPAY_API_KEY = process.env.SEPAY_API_KEY; // Token for verifying webhook

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { plan, amount } = req.body;

        if (!plan || !amount) {
            res.status(400).json({ message: 'Plan and Amount are required' });
            return;
        }

        // 1. Create Transaction Record
        const transaction = await prisma.transaction.create({
            data: {
                userId: String(userId),
                amount: Number(amount),
                description: `NAP ${plan} ${userId.substring(0, 5)}`, // Short description
                plan: plan as PlanType,
                status: 'PENDING'
            }
        });

        // 2. Generate QR Code URL
        // Format: https://img.vietqr.io/image/<BANK>-<ACCOUNT>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
        // Use condensed content for better scanning: "SEPAY <TRANS_ID>"
        const transferContent = `SEPAY ${transaction.id}`;

        // Update transaction with the content we expect
        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { description: transferContent }
        });

        const qrUrl = `https://img.vietqr.io/image/${SEPAY_BANK_PROVIDER}-${SEPAY_ACCOUNT_NUMBER}-compact.png?amount=${amount}&addInfo=${transferContent}`;

        res.status(201).json({
            transactionId: transaction.id,
            qrUrl,
            transferContent,
            amount
        });

    } catch (error) {
        console.error('Create Payment error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const handleSepayWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        // Sepay structure: { gateway, transactionDate, accountNumber, subAccount, transferType, transferAmount, transferContent, referenceCode, description, id }
        const data = req.body;
        console.log('[SEPAY WEBHOOK] Received:', JSON.stringify(data));

        // 1. Verify Token (Security)
        const authHeader = req.headers['authorization'];
        if (SEPAY_API_KEY && authHeader !== `Bearer ${SEPAY_API_KEY}`) {
            console.error('[SEPAY WEBHOOK] Invalid Token');
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        // 2. Parse Content to find Transaction ID
        // Expected content: "SEPAY clt..."
        // Regex to find "SEPAY" followed by ID
        const content = data.content || data.transferContent || data.description;
        const match = content?.match(/SEPAY\s+([a-zA-Z0-9]+)/i);

        if (!match) {
            console.log('[SEPAY WEBHOOK] Valid pattern not found in content:', content);
            res.status(200).json({ message: 'Ignored: No pattern match' });
            return;
        }

        const transactionId = match[1];

        // 3. Find Transaction
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) {
            console.log('[SEPAY WEBHOOK] Transaction not found:', transactionId);
            res.status(200).json({ message: 'Transaction not found' });
            return;
        }

        if (transaction.status === 'PAID') {
            res.status(200).json({ message: 'Already processed' });
            return;
        }

        // 4. Verify Amount (Allow small variance? No, strict for now)
        if (data.transferAmount < transaction.amount) {
            console.log('[SEPAY WEBHOOK] Insufficient amount');
            res.status(200).json({ message: 'Insufficient amount' });
            return;
        }

        // 5. SUCCESS: Update Transaction & Upgrade Plan
        await prisma.$transaction(async (tx) => {
            // Update Transaction
            await tx.transaction.update({
                where: { id: transactionId },
                data: {
                    status: 'PAID',
                    gatewayTransactionId: String(data.id),
                    updatedAt: new Date()
                }
            });

            // Upgrade User Plan
            // Use SubscriptionService logic but inside transaction if possible, or just call update
            await tx.subscription.upsert({
                where: { userId: transaction.userId },
                update: { plan: transaction.plan },
                create: {
                    userId: transaction.userId,
                    plan: transaction.plan
                }
            });
        });

        console.log(`[SEPAY WEBHOOK] Successfully upgraded user ${transaction.userId} to ${transaction.plan}`);
        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getTransactionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}
