import { fetchJSON } from '@/helpers/fetchJSON.js';
import { waitForSignedKeyRequest } from '@/helpers/waitForSignedKeyRequest.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { ResponseJSON } from '@/types/index.js';

/**
 * Initiates the creation of a session by granting data access permission to another FID.
 * @param signal
 * @returns
 */
export async function createSessionByGrantPermission(setUrl?: (url: string) => void, signal?: AbortSignal) {
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
    });
    if (!response.success) throw new Error(response.error.message);

    // present QR code to the user
    setUrl?.(response.data.deeplinkUrl);

    const signedResponse = await waitForSignedKeyRequest(signal)(response.data.token);

    return new FarcasterSession(
        `${signedResponse.result.signedKeyRequest.userFid}`,
        response.data.privateKey,
        response.data.timestamp,
        response.data.expiresAt,
        response.data.token,
    );
}
