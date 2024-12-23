import { getPublicKey, utils } from '@noble/ed25519';
import { bytesToHex } from '@noble/hashes/utils';
import { type Hex, toHex } from 'viem';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { FarcasterSession, FarcasterSponsorship } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import type { Account } from '@/providers/types/Account.js';
import { pollingSignerRequestToken } from '@/providers/warpcast/pollingSignerRequestToken.js';
import { type SignedKeyRequestBody, signedKeyRequests } from '@/providers/warpcast/signedKeyRequests.js';
import { bindOrRestoreFireflySession } from '@/services/bindFireflySession.js';
import type { ResponseJSON } from '@/types/index.js';

interface SignedBody {
    body: SignedKeyRequestBody;
    timestamp: number;
    expiresAt: number;
}

async function createSession(signal?: AbortSignal) {
    const privateKey = utils.randomPrivateKey();
    const publicKey: Hex = `0x${bytesToHex(await getPublicKey(privateKey))}`;

    const response = await fetchJSON<ResponseJSON<SignedBody>>('/api/firefly/sponsorship', {
        method: 'POST',
        signal,
        body: JSON.stringify({
            key: publicKey,
        }),
    });
    if (!response.success) throw new Error(response.error.message);

    const keyResponse = await signedKeyRequests(response.data.body, signal);

    const farcasterSession = new FarcasterSession(
        `${keyResponse.result.signedKeyRequest.requestFid}`,
        toHex(privateKey),
        response.data.timestamp,
        response.data.expiresAt,
        // the signer request token is one-time use
        keyResponse.result.signedKeyRequest.token,
        undefined,
        `${FarcasterSponsorship.Firefly}-${response.data.body.sponsorship?.signature ?? '0x'}`,
    );

    return {
        deeplink: keyResponse.result.signedKeyRequest.deeplinkUrl,
        session: farcasterSession,
    };
}

async function initialSignerRequestToken(callback?: (url: string) => void, signal?: AbortSignal) {
    const { deeplink, session } = await createSession(signal);

    // invalid session type
    if (!FarcasterSession.isSponsorship(session)) throw new Error('Invalid session type');

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

export async function createAccountByFireflySponsorship(callback?: (url: string) => void, signal?: AbortSignal) {
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
