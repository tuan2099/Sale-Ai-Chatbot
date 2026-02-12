import axios from 'axios';

export const sendZaloMessage = async (recipientId: string, text: string, accessToken: string) => {
    try {
        const url = 'https://openapi.zalo.me/v2.0/oa/message';
        await axios.post(url, {
            recipient: { user_id: recipientId },
            message: { text }
        }, {
            headers: { access_token: accessToken }
        });
        console.log(`[ZALO] Sent message to ${recipientId}`);
    } catch (error: any) {
        console.error('[ZALO] Send error:', error.response?.data || error.message);
    }
};
