import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendFacebookMessage } from '../services/facebookService';
import { sendZaloMessage } from '../services/zaloService';
import { handleChatMessage } from './chatController'; // Import logic directly or refactor
// IMPORTANT: We need a way to reuse the AI logic without duplicating it.
// Ideally, we should exact the AI processing logic into a service.
// For now, I will perform a simplified AI call here or call an internal service.
// To keep it simple and robust, I'll duplicate the AI call logic slightly or refactor chatController later.
// Actually, let's look at chatController. It takes req, res. We can't easily reuse it as is.
// I will implement a "processAIResponse" function here or in a service.

const prisma = new PrismaClient();

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
                    } else {
                        // 6. Trigger AI (Simulated for now, calling external API or logic)
                        // TODO: Refactor AI logic to be reusable. For now, sending a placeholder.
                        const aiResponse = "Xin chào! Hiện tại tôi đang bận, sẽ trả lời bạn sau nhé. (Tính năng AI đang được kết nối)";

                        await sendFacebookMessage(sender_psid, aiResponse, store.fbAccessToken || "");

                        await prisma.message.create({
                            data: {
                                conversationId: conversation.id,
                                role: 'AI',
                                content: aiResponse
                            }
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
    // Implement Zalo logic similar to Facebook
    // Zalo often sends events differently (OA sends message)
    // For now, logging the payload
    console.log('[ZALO] Webhook:', req.body);
    res.status(200).send('OK');
};
