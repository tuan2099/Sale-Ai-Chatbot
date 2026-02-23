import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendFacebookMessage } from '../services/facebookService';
import { sendZaloMessage } from '../services/zaloService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

const prisma = new PrismaClient();

async function generateAIResponse(storeId: string, message: string, history: any[]) {
    try {
        const provider = process.env.AI_PROVIDER?.toLowerCase() || 'gemini';

        // 1. Fetch Store Config
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });

        if (!store) {
            throw new Error('Store not found');
        }

        // 2. Fetch Knowledge
        const knowledges = await prisma.knowledge.findMany({
            where: {
                storeId,
                status: 'COMPLETED'
            }
        });

        const knowledgeContext = knowledges.map((k: any) => `[Nguồn: ${k.name}]\n${k.content}`).join('\n\n');

        // 3. Build System Prompt
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

        if (provider === 'openai') {
            const messages = [
                { role: 'system', content: systemPrompt },
                ...(history?.map((h: any) => ({
                    role: h.role === 'USER' ? 'user' : 'assistant',
                    content: h.content,
                })) || []),
                { role: 'user', content: message }
            ];

            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: messages as any,
            });

            aiText = completion.choices[0].message.content || "Xin lỗi, đã có lỗi xảy ra.";
        } else {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash-lite",
                systemInstruction: systemPrompt
            });

            const chatHistory = history?.map((h: any) => ({
                role: h.role === 'USER' ? 'user' : 'model',
                parts: [{ text: h.content }],
            })) || [];

            let filteredHistory = chatHistory;
            while (filteredHistory.length > 0 && filteredHistory[0].role !== 'user') {
                filteredHistory.shift();
            }

            const chat = model.startChat({
                history: filteredHistory,
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            aiText = response.text();
        }

        return aiText;
    } catch (error) {
        console.error('[AI] Error generating response:', error);
        return "Xin lỗi, hiện tại tôi đang gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé!";
    }
}

// ==========================================
// FACEBOOK WEBHOOK
// ==========================================

// Verify Webhook (GET)
export const verifyFacebookWebhook = async (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        // In production, check against a specific verify token stored in DB or ENV
        // For simplicity, we accept any token or a fixed one "sale_ai_verify"
        if (mode === 'subscribe' && token === 'sale_ai_verify') {
            console.log('[FB] Webhook verified');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
};

// Handle Event (POST)
export const handleFacebookEvent = async (req: Request, res: Response) => {
    try {
        const body = req.body;

        if (body.object === 'page') {
            // Iterate over each entry - there may be multiple if batched
            for (const entry of body.entry) {
                const pageId = entry.id; // The Page ID

                // Get the message event
                const webhook_event = entry.messaging[0];
                const sender_psid = webhook_event.sender.id; // Customer ID

                if (webhook_event.message && webhook_event.message.text) {
                    const messageText = webhook_event.message.text;
                    console.log(`[FB] Msg from ${sender_psid}: ${messageText}`);

                    // 1. Find the Store
                    const store = await prisma.store.findFirst({
                        where: { fbPageId: pageId }
                    });

                    if (!store) {
                        console.error(`[FB] Store not found for Page ID ${pageId}`);
                        continue;
                    }

                    // 2. Find/Create Customer
                    let customer = await prisma.customer.findFirst({
                        where: { fbUserId: sender_psid, storeId: store.id }
                    });

                    if (!customer) {
                        customer = await prisma.customer.create({
                            data: {
                                name: "Facebook User", // We can fetch name later via Graph API
                                fbUserId: sender_psid,
                                storeId: store.id,
                                channel: "Facebook",
                                userId: store.userId // Assign to store owner
                            }
                        });
                    }

                    // 3. Find/Create Conversation
                    let conversation = await prisma.conversation.findFirst({
                        where: { customerId: customer.id, storeId: store.id }
                    });

                    if (!conversation) {
                        conversation = await prisma.conversation.create({
                            data: {
                                customerId: customer.id,
                                storeId: store.id,
                                platform: "FACEBOOK"
                            }
                        });
                    }

                    // 4. Save User Message
                    await prisma.message.create({
                        data: {
                            conversationId: conversation.id,
                            role: 'USER',
                            content: messageText
                        }
                    });

                    if ((conversation as any).isAiSuspended) {
                        console.log(`[FB] AI suspended for conversation ${conversation.id}`);
                        continue;
                    }

                    // 5. Check Scripts (Keyword Auto-Reply)
                    const scripts = await prisma.script.findMany({
                        where: { storeId: store.id, isActive: true }
                    });
                    const lowerMsg = messageText.toLowerCase();
                    const matchedScript = scripts.find(s => lowerMsg.includes(s.keyword.toLowerCase()));

                    if (matchedScript) {
                        // Send Script Response
                        await sendFacebookMessage(sender_psid, matchedScript.response, store.fbAccessToken || "");
                        // Save Bot Message
                        await prisma.message.create({
                            data: {
                                conversationId: conversation.id,
                                role: 'AI',
                                content: matchedScript.response
                            }
                        });
                        await prisma.conversation.update({
                            where: { id: conversation.id },
                            data: { lastMessage: matchedScript.response, updatedAt: new Date() }
                        });
                    } else {
                        // 6. Trigger AI
                        const history = await prisma.message.findMany({
                            where: { conversationId: conversation.id },
                            orderBy: { createdAt: 'asc' },
                            take: 10
                        });

                        const aiResponseText = await generateAIResponse(store.id, messageText, history);

                        await sendFacebookMessage(sender_psid, aiResponseText, store.fbAccessToken || "");

                        await prisma.message.create({
                            data: {
                                conversationId: conversation.id,
                                role: 'AI',
                                content: aiResponseText
                            }
                        });
                        await prisma.conversation.update({
                            where: { id: conversation.id },
                            data: { lastMessage: aiResponseText, updatedAt: new Date() }
                        });
                    }
                }
            }
            res.status(200).send('EVENT_RECEIVED');
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('[FB] Webhook Error:', error);
        res.sendStatus(500);
    }
};

// ==========================================
// ZALO WEBHOOK
// ==========================================

export const handleZaloEvent = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        console.log('[ZALO] Webhook Received:', JSON.stringify(body));

        // Let Zalo know we received the webhook immediately
        res.status(200).send({
            error: 0,
            message: "ok"
        });

        const eventName = body.event_name;

        if (eventName === 'user_send_text') {
            const oaId = body.recipient?.id;
            const senderId = body.sender?.id;
            const messageText = body.message?.text;

            if (!oaId || !senderId || !messageText) {
                return;
            }

            // 1. Find the Store by Zalo OA ID
            const store = await prisma.store.findFirst({
                where: { zaloOaId: String(oaId) }
            });

            if (!store) {
                console.error(`[ZALO] Store not found for OA ID ${oaId}`);
                return;
            }

            // 2. Find/Create Customer
            let customer = await prisma.customer.findFirst({
                where: { zaloUserId: senderId, storeId: store.id }
            });

            if (!customer) {
                customer = await prisma.customer.create({
                    data: {
                        name: "Zalo User",
                        zaloUserId: senderId,
                        storeId: store.id,
                        channel: "Zalo",
                        userId: store.userId
                    }
                });
            }

            // 3. Find/Create Conversation
            let conversation = await prisma.conversation.findFirst({
                where: { customerId: customer.id, storeId: store.id, status: 'OPEN' }
            });

            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: {
                        customerId: customer.id,
                        storeId: store.id,
                        platform: "ZALO"
                    }
                });
            }

            // 4. Save User Message
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'USER',
                    content: messageText
                }
            });

            // CHECK: If AI is suspended (Manual Mode), stop here.
            if ((conversation as any).isAiSuspended) {
                console.log(`[ZALO] AI suspended for conversation ${conversation.id}`);
                return;
            }

            // 5. Check Scripts (Keyword Auto-Reply)
            const scripts = await prisma.script.findMany({
                where: { storeId: store.id, isActive: true }
            });
            const lowerMsg = messageText.toLowerCase();
            const matchedScript = scripts.find(s => lowerMsg.includes(s.keyword.toLowerCase()));

            if (matchedScript) {
                // Send Script Response
                await sendZaloMessage(senderId, matchedScript.response, store.zaloAccessToken || "");

                // Save Bot Message
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        role: 'AI',
                        content: matchedScript.response
                    }
                });

                await prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { lastMessage: matchedScript.response, updatedAt: new Date() }
                });
                return;
            }

            // 6. Process AI Response
            const history = await prisma.message.findMany({
                where: { conversationId: conversation.id },
                orderBy: { createdAt: 'asc' },
                take: 10
            });

            const aiResponseText = await generateAIResponse(store.id, messageText, history);

            // 7. Send AI Response
            await sendZaloMessage(senderId, aiResponseText, store.zaloAccessToken || "");

            // 8. Save AI Message
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    role: 'AI',
                    content: aiResponseText
                }
            });

            await prisma.conversation.update({
                where: { id: conversation.id },
                data: { lastMessage: aiResponseText, updatedAt: new Date() }
            });

        } else {
            console.log(`[ZALO] Ignored event: ${eventName}`);
        }
    } catch (error) {
        console.error('[ZALO] Webhook Error:', error);
    }
};
