import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const storeId = req.params.storeId as string;
        const { message, history, customerInfo } = req.body;

        if (!message) {
            res.status(400).json({ message: 'Message is required' });
            return;
        }

        // 1. Fetch Store Config
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        // 2. Find or Create Customer
        let customer;
        if (customerInfo?.email) {
            customer = await prisma.customer.findFirst({
                where: { email: customerInfo.email, storeId }
            });
        }

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name: customerInfo?.name || "Guest Customer",
                    email: customerInfo?.email || null,
                    phoneNumber: customerInfo?.phoneNumber || null,
                    storeId,
                    userId: store.userId,
                    channel: 'Website'
                }
            });
        }

        // 3. Find or Create Conversation
        let conversation = await (prisma as any).conversation.findFirst({
            where: {
                storeId,
                customerId: customer.id,
                status: 'OPEN'
            }
        });

        if (!conversation) {
            conversation = await (prisma as any).conversation.create({
                data: {
                    storeId,
                    customerId: customer.id,
                    status: 'OPEN'
                }
            });
        }

        // 4. Save Customer Message
        await (prisma as any).message.create({
            data: {
                conversationId: conversation.id,
                role: 'USER',
                content: message
            }
        });

        // 5. Fetch Knowledge
        const knowledges = await (prisma as any).knowledge.findMany({
            where: {
                storeId,
                status: 'COMPLETED'
            }
        });

        const knowledgeContext = knowledges.map((k: any) => `[Nguồn: ${k.name}]\n${k.content}`).join('\n\n');

        // 6. Build System Prompt
        const systemPrompt = `
Bạn là một trợ lý AI tên là "${store.aiName}" của cửa hàng "${store.name}".
Mô tả: ${store.description || "N/A"}.
Identity: ${store.aiIdentity || "N/A"}
Style: ${store.aiStyle || "Professional"}
Requirements: ${store.aiRequirements || "Short answers"}
Exceptions: ${store.aiExceptions || "N/A"}
Priority: ${store.aiPriorityInstructions || "Use knowledge"}

KIẾN THỨC CỬA HÀNG:
${knowledgeContext || "No specific data."}

LƯU Ý: Trả lời bằng Tiếng Việt. Chỉ nói về cửa hàng.
`;

        // 7. Call Gemini
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: history?.map((h: any) => ({
                role: h.role === 'USER' ? 'user' : 'model',
                parts: [{ text: h.content }],
            })) || [],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const aiText = response.text();

        // 8. Save AI Message & Update Conversation
        await (prisma as any).message.create({
            data: {
                conversationId: conversation.id,
                role: 'AI',
                content: aiText
            }
        });

        await (prisma as any).conversation.update({
            where: { id: conversation.id },
            data: {
                lastMessage: aiText,
                updatedAt: new Date()
            }
        });

        res.status(200).json({
            role: 'AI',
            content: aiText
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
