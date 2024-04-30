import { getPublicKey, utils } from '@noble/ed25519';
import { toHex } from 'viem';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { waitForSignedKeyRequest } from '@/helpers/waitForSignedKeyRequest.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { ResponseJSON } from '@/types/index.js';

/**
 * Initiates the creation of a session by granting data access permission to another FID.
 * @param signal
 * @returns
 */
export async function createSessionByGrantPermission(callback?: (url: string) => void, signal?: AbortSignal) {
    const privateKey = utils.randomPrivateKey();
    const publicKey: `0x${string}` = `0x${Buffer.from(await getPublicKey(privateKey)).toString('hex')}`;

    const response = await fetchJSON<
        ResponseJSON<{
            fid: string;
            token: string;
            timestamp: number;
            expiresAt: number;
            deeplinkUrl: string;
        }>
    >('/api/warpcast/signin', {
        method: 'POST',
        body: JSON.stringify({
            key: toHex(publicKey),
        }),
    });
    if (!response.success) throw new Error(response.error.message);

    // present QR code to the user or open the link in a new tab
    callback?.(response.data.deeplinkUrl);

    const signedResponse = await waitForSignedKeyRequest(signal)(response.data.token);

    return new FarcasterSession(
        `${signedResponse.result.signedKeyRequest.userFid}`,
        toHex(privateKey),
        response.data.timestamp,
        response.data.expiresAt,
        response.data.token,
    );
}
