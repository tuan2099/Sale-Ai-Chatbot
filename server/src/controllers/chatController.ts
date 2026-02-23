import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { SubscriptionService } from '../services/subscriptionService';

dotenv.config();

const prisma = new PrismaClient();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

export const handleChatMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const storeId = req.params.storeId as string;
        const { message, history, customerInfo, conversationId } = req.body;
        const provider = process.env.AI_PROVIDER?.toLowerCase() || 'gemini';

        if (!message) {
            res.status(400).json({ message: 'Message is required' });
            return;
        }

        console.log(`[CHAT LOG] Message from Public Widget for Store: ${storeId}`);
        console.log(`[CHAT LOG] Received conversationId: ${conversationId || 'null'}`);
        console.log(`[CHAT LOG] Raw Body:`, JSON.stringify(req.body));

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
        let existingConversation = null;

        if (conversationId) {
            existingConversation = await (prisma as any).conversation.findUnique({
                where: { id: conversationId },
                include: { customer: true }
            });
            if (existingConversation) {
                console.log(`[CHAT LOG] Found existing conversation: ${existingConversation.id}`);
                customer = existingConversation.customer;
            } else {
                console.log(`[CHAT LOG] conversationId ${conversationId} not found in DB`);
            }
        }

        if (!customer && customerInfo?.email) {
            customer = await prisma.customer.findFirst({
                where: { email: customerInfo.email, storeId }
            });
        }

        if (!customer) {
            customer = await (prisma as any).customer.create({
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
        let conversation = existingConversation;

        if (!conversation) {
            conversation = await (prisma as any).conversation.findFirst({
                where: {
                    storeId,
                    customerId: customer.id,
                    status: 'OPEN'
                }
            });
            if (conversation) {
                console.log(`[CHAT LOG] Found existing OPEN conversation for customer: ${conversation.id}`);
            }
        }

        if (!conversation) {
            conversation = await (prisma as any).conversation.create({
                data: {
                    storeId,
                    customerId: customer.id,
                    status: 'OPEN'
                }
            });
            console.log(`[CHAT LOG] Created NEW conversation: ${conversation.id}`);
        } else {
            console.log(`[CHAT LOG] Using conversation: ${conversation.id}`);
        }

        // 4. Save Customer Message
        await (prisma as any).message.create({
            data: {
                conversationId: conversation.id,
                role: 'USER',
                content: message
            }
        });

        // CHECK: If AI is suspended (Manual Mode), stop here.
        if (conversation.isAiSuspended) {
            console.log(`[CHAT LOG] AI is suspended for conversation ${conversation.id}. Skip generation.`);
            res.status(200).json({
                role: 'AI',
                content: null, // No content from AI
                conversationId: conversation.id,
                isAiSuspended: true
            });
            return;
        }

        // 5. Check Subscription Limit (AI Usage)
        const canChat = await SubscriptionService.canSendAiMessage(store.userId);
        if (!canChat) {
            console.log(`[CHAT LOG] Subscription limit reached for user ${store.userId}`);
            const limitMsg = "Gói dịch vụ của bạn đã hết hạn mức tin nhắn AI. Vui lòng nâng cấp để tiếp tục sử dụng.";

            await (prisma as any).message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'AI',
                    content: limitMsg
                }
            });

            await (prisma as any).conversation.update({
                where: { id: conversation.id },
                data: { lastMessage: limitMsg, updatedAt: new Date() }
            });

            res.status(200).json({
                role: 'AI',
                content: limitMsg,
                conversationId: conversation.id,
                isLimitReached: true
            });
            return;
        }

        // 6. Check for Scripted Auto-Replies (Keyword Match)
        // Only check if AI is NOT suspended (or maybe even if it is? Let's assume Script overrides everything except manual mode... 
        // actually if Manual Mode is ON, we shouldn't reply at all. So check this AFTER the isAiSuspended check)

        const scripts = await (prisma as any).script.findMany({
            where: { storeId, isActive: true }
        });

        const lowerMessage = message.toLowerCase();
        const matchedScript = scripts.find((s: any) => lowerMessage.includes(s.keyword.toLowerCase()));

        if (matchedScript) {
            console.log(`[CHAT LOG] Matched Script: "${matchedScript.keyword}"`);

            // Save AI Message (Scripted)
            await (prisma as any).message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'AI',
                    content: matchedScript.response
                }
            });

            await (prisma as any).conversation.update({
                where: { id: conversation.id },
                data: {
                    lastMessage: matchedScript.response,
                    updatedAt: new Date()
                }
            });

            res.status(200).json({
                role: 'AI',
                content: matchedScript.response,
                conversationId: conversation.id
            });
            return;
        }

        // 6. Fetch Knowledge
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

        let aiText = "";

        // 7. Call AI Provider
        console.log(`[CHAT LOG] Calling AI Provider: ${provider}`);

        try {
            if (provider === 'openai') {
                // OpenAI implementation
                const messages = [
                    { role: 'system', content: systemPrompt },
                    ...(history?.map((h: any) => ({
                        role: h.role === 'USER' ? 'user' : 'assistant',
                        content: h.content,
                    })) || []),
                    { role: 'user', content: message }
                ];

                console.log(`[CHAT LOG] Sending request to OpenAI...`);
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini", // Use mini as a faster/cheaper default
                    messages: messages as any,
                });
                console.log(`[CHAT LOG] OpenAI Response received.`);

                aiText = completion.choices[0].message.content || "Xin lỗi, đã có lỗi xảy ra.";
            } else {
                // Gemini implementation (Default)
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.0-flash-lite",
                    systemInstruction: systemPrompt
                });

                const chatHistory = history?.map((h: any) => ({
                    role: h.role === 'USER' ? 'user' : 'model',
                    parts: [{ text: h.content }],
                })) || [];

                // Gemini requires history to start with a 'user' message
                let filteredHistory = chatHistory;
                while (filteredHistory.length > 0 && filteredHistory[0].role !== 'user') {
                    filteredHistory.shift();
                }

                console.log(`[CHAT LOG] Sending request to Gemini...`);
                const chat = model.startChat({
                    history: filteredHistory,
                });

                const result = await chat.sendMessage(message);
                const response = await result.response;
                console.log(`[CHAT LOG] Gemini Response received.`);
                aiText = response.text();
            }
        } catch (aiError) {
            console.error('[CHAT LOG] AI Provider Error:', aiError);
            aiText = "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối. Bạn vui lòng chờ giây lát rồi thử lại nhé!";
        }

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

        // Increment AI Usage
        await SubscriptionService.incrementAiUsage(store.userId);

        res.status(200).json({
            role: 'AI',
            content: aiText,
            conversationId: conversation.id
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPublicMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { conversationId } = req.params;

        const messages = await (prisma as any).message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Get Public Messages error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const submitLeadForm = async (req: Request, res: Response): Promise<void> => {
    try {
        const storeId = req.params.storeId as string;
        const { name, email, phoneNumber, address, note } = req.body;

        // 1. Fetch Store Config
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        if (!store) {
            res.status(404).json({ message: 'Store not found' });
            return;
        }

        // 2. Find or Create Customer
        let customer = await prisma.customer.findFirst({
            where: {
                storeId,
                OR: [
                    { email: email || undefined },
                    { phoneNumber: phoneNumber || undefined }
                ]
            }
        });

        if (customer) {
            // Update existing customer
            customer = await (prisma as any).customer.update({
                where: { id: customer.id },
                data: {
                    name,
                    email: email || customer.email,
                    phoneNumber: phoneNumber || customer.phoneNumber,
                    address: address || (customer as any).address, // Use existing if not provided
                }
            });
        } else {
            // Create new customer
            customer = await (prisma as any).customer.create({
                data: {
                    name,
                    email: email || null,
                    phoneNumber: phoneNumber || null,
                    address: address || null,
                    storeId,
                    userId: store.userId,
                    channel: 'Website'
                }
            });
        }

        if (!customer) {
            res.status(500).json({ message: 'Failed to create or find customer' });
            return;
        }

        // 3. Create Note if provided
        if (note) {
            await (prisma as any).note.create({
                data: {
                    content: note,
                    customerId: customer.id,
                    userId: store.userId
                }
            });
        }

        // 4. Create Conversation if needed (Optional, usually we wait for first message)
        // But for Lead Form, we might want to ensure a conversation exists
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

        res.status(200).json({
            message: 'Lead submitted successfully',
            customerId: customer.id,
            conversationId: conversation.id
        });

    } catch (error) {
        console.error('Submit Lead Form error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
