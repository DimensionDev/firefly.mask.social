import { fetchJSON } from '@/helpers/fetchJSON.js';
import { waitForSignedKeyRequestComplete } from '@/helpers/waitForSignedKeyRequestComplete.js';
import { WarpcastSession } from '@/providers/warpcast/Session.js';
import type { ResponseJSON } from '@/types/index.js';

/**
 * Initiates the creation of a session by granting data access permission to another FID.
 * @param signal
 * @returns
 */
export async function createSessionByGrantPermission(setUrl?: (url: string) => void, signal?: AbortSignal) {
    const response = await fetchJSON<
        ResponseJSON<{
            publicKey: string;
            privateKey: string;
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

    await waitForSignedKeyRequestComplete(signal)(response.data.token);

    return new WarpcastSession(
        response.data.fid,
        response.data.token,
        response.data.timestamp,
        response.data.expiresAt,
        response.data.privateKey,
    );
}
