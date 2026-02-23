import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const refreshZaloToken = async (storeId: string, appId: string, secretKey: string, refreshToken: string) => {
    try {
        const url = 'https://oauth.zaloapp.com/v4/oa/access_token';
        const params = new URLSearchParams();
        params.append('app_id', appId);
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);

        const response = await axios.post(url, params, {
            headers: {
                'secret_key': secretKey,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const data = response.data;
        if (data.access_token) {
            // Update DB
            await prisma.store.update({
                where: { id: storeId },
                data: {
                    zaloAccessToken: data.access_token,
                    zaloRefreshToken: data.refresh_token || refreshToken // Usually Zalo gives a new refresh token
                }
            });
            console.log(`[ZALO] Refreshed access token successfully for store ${storeId}`);
            return data.access_token;
        } else {
            console.error('[ZALO] Refresh error response:', data);
            return null;
        }
    } catch (error: any) {
        console.error('[ZALO] Refresh Token Exception:', error.response?.data || error.message);
        return null;
    }
};

export const sendZaloMessage = async (recipientId: string, text: string, storeId?: string, accessToken?: string, retryCount = 0): Promise<boolean> => {
    try {
        if (!accessToken) {
            console.error('[ZALO] No access token provided to send message');
            return false;
        }

        const url = 'https://openapi.zalo.me/v2.0/oa/message';
        const response = await axios.post(url, {
            recipient: { user_id: recipientId },
            message: { text }
        }, {
            headers: { access_token: accessToken }
        });

        const data = response.data;
        // Zalo returns `{ error: <number>, message: <string> }` structure inside HTTP 200 OMGGGG!!
        if (data.error !== 0) {
            console.error(`[ZALO] Send Error Code ${data.error}:`, data.message);

            // Error code -216 is Invalid access token / Token expired
            if (data.error === -216 && storeId && retryCount < 1) {
                console.log(`[ZALO] Token expired for store ${storeId}. Attempting refresh...`);
                // Fetch the store config
                const store = await prisma.store.findUnique({ where: { id: storeId } });

                if (store && store.zaloAppId && store.zaloSecretKey && store.zaloRefreshToken) {
                    const newToken = await refreshZaloToken(storeId, store.zaloAppId, store.zaloSecretKey, store.zaloRefreshToken);
                    if (newToken) {
                        // Retry sending the message
                        return await sendZaloMessage(recipientId, text, storeId, newToken, retryCount + 1);
                    } else {
                        console.error('[ZALO] Could not retrieve new token for retry.');
                    }
                } else {
                    console.log(`[ZALO] Missing App ID or Secret Key to refresh token for store ${storeId}`);
                }
            }
            return false;
        }

        console.log(`[ZALO] Sent message to ${recipientId}`);
        return true;
    } catch (error: any) {
        console.error('[ZALO] Send network exception:', error.response?.data || error.message);
        return false;
    }
};
