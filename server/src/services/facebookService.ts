import axios from 'axios';

export const sendFacebookMessage = async (recipientId: string, text: string, accessToken: string) => {
    try {
        const url = `https://graph.facebook.com/v19.0/me/messages?access_token=${accessToken}`;
        await axios.post(url, {
            recipient: { id: recipientId },
            message: { text }
        });
        console.log(`[FB] Sent message to ${recipientId}`);
    } catch (error: any) {
        console.error('[FB] Send error:', error.response?.data || error.message);
    }
};
