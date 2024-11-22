import { getPublicKey, utils } from '@noble/ed25519';
import { toHex } from 'viem';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { Account } from '@/providers/types/Account.js';
import { pollingSignerRequestToken } from '@/providers/warpcast/pollingSignerRequestToken.js';
import { bindOrRestoreFireflySession } from '@/services/bindFireflySession.js';
import type { ResponseJSON } from '@/types/index.js';

interface WarpcastSignInResponse {
    fid: string;
    token: string;
    timestamp: number;
    expiresAt: number;
    // URL to present to user to scan
    deeplinkUrl: string;
}

async function createSession(signal?: AbortSignal) {
    // create key pair in client side
    const privateKey = utils.randomPrivateKey();
    const publicKey: `0x${string}` = `0x${Buffer.from(await getPublicKey(privateKey)).toString('hex')}`;

    const response = await fetchJSON<ResponseJSON<WarpcastSignInResponse>>('/api/warpcast/signin', {
        method: 'POST',
        body: JSON.stringify({
            key: publicKey,
        }),
        signal,
    });
    if (!response.success) throw new Error(response.error.message);

    const farcasterSession = new FarcasterSession(
        // we don't posses the fid until the key request was signed
        '',
        toHex(privateKey),
        response.data.timestamp,
        response.data.expiresAt,
        // the signer request token is one-time use
        response.data.token,
    );

    return {
        deeplink: response.data.deeplinkUrl,
        session: farcasterSession,
    };
}

/**
 * Initiates the creation of a session by granting data access permission to another FID.
 * @param signal
 * @returns
 */
async function initialSignerRequestToken(callback?: (url: string) => void, signal?: AbortSignal) {
    const { deeplink, session } = await createSession(signal);

    // invalid session type
    if (!FarcasterSession.isGrantByPermission(session)) throw new Error('Invalid session type');

    // present QR code to the user or open the link in a new tab
    callback?.(deeplink);

    const result = await pollingSignerRequestToken(session.signerRequestToken, signal);
    if (result.userFid) {
        session.profileId = `${result.userFid}`;
    }

    // polling failed
    if (!session.profileId)
        throw new Error(
            'Failed to query the signed key request status after several attempts. Please try again later.',
        );

    return session;
}

export async function createAccountByGrantPermission(callback?: (url: string) => void, signal?: AbortSignal) {
    const session = await initialSignerRequestToken(callback, signal);

    // polling for the session to be ready
    const fireflySession = await bindOrRestoreFireflySession(session, signal);

    // profile id is available after the session is ready
    const profile = await FarcasterSocialMediaProvider.getProfileById(session.profileId);

    return {
        session,
        profile,
        fireflySession,
    } satisfies Account;
}
