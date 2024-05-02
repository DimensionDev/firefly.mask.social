import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { SignedKeyRequestResponse } from '@/providers/types/Warpcast.js';
import type { ResponseJSON } from '@/types/index.js';

/**
 * Initiates the creation of a session by granting data access permission to another FID.
 * @param signal
 * @returns
 */
export async function createSessionByGrantPermission(callback?: (url: string) => void, signal?: AbortSignal) {
    const response = await fetchJSON<
        ResponseJSON<{
            publicKey: `0x${string}`;
            privateKey: `0x${string}`;
            fid: string;
            token: string;
            timestamp: number;
            expiresAt: number;
            deeplinkUrl: string;
        }>
    >('/api/warpcast/signin', {
        method: 'POST',
        signal,
    });
    if (!response.success) throw new Error(response.error.message);

    // present QR code to the user or open the link in a new tab
    callback?.(response.data.deeplinkUrl);

    const query = async () => {
        const signedKeyResponse = await fetchJSON<ResponseJSON<SignedKeyRequestResponse>>(
            urlcat('/api/warpcast/signed-key', {
                token: response.data.token,
            }),
            {
                signal,
            },
        );
        if (!signedKeyResponse.success) throw new Error(signedKeyResponse.error.message);
        return signedKeyResponse.data;
    };

    // vercel serverless function has a timeout of 15 seconds by default
    // we extended the timeout to 30 seconds and will retry 10 times
    const queryTimes = async (times = 10) => {
        let lastError = null;

        for (let i = 0; i < times; i += 1) {
            try {
                return await query();
            } catch (error) {
                lastError = error;
                continue;
            }
        }
        throw lastError;
    };

    const result = await queryTimes();

    if (result?.result.signedKeyRequest.userFid)
        return new FarcasterSession(
            `${result.result.signedKeyRequest.userFid}`,
            response.data.privateKey,
            response.data.timestamp,
            response.data.expiresAt,
            response.data.token,
        );

    throw new Error(
        result
            ? JSON.stringify(result)
            : 'Failed to query the signed key request status after several attempts. Please try again later.',
    );
}
