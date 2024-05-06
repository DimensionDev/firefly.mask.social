import { getPublicKey, utils } from '@noble/ed25519';
import urlcat from 'urlcat';
import { toHex } from 'viem';

import { FARCASTER_REPLY_URL, SITE_HOSTNAME, SITE_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { parseURL } from '@/helpers/parseURL.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { SignedKeyRequestResponse } from '@/providers/types/Warpcast.js';
import type { ResponseJSON } from '@/types/index.js';

interface WarpcastSignInResponse {
    fid: string;
    token: string;
    timestamp: number;
    expiresAt: number;
    deeplinkUrl: string;
}

interface FarcasterReplyResponse {
    channelToken: string;
    url: string;
    // the same as url
    connectUri: string;
    // cspell: disable-next-line
    // example: dpO7VRkrPcwyLhyFZ
    nonce: string;
}

async function createChallengeFromWarpcast(signal?: AbortSignal) {
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

async function createChallengeFromFarcasterRelay(signal?: AbortSignal) {
    const url = urlcat(FARCASTER_REPLY_URL, '/v1/channel');
    const response = await fetchJSON<FarcasterReplyResponse>(url, {
        method: 'POST',
        body: JSON.stringify({
            siweUri: SITE_URL,
            domain: parseURL(SITE_URL)?.hostname ?? SITE_HOSTNAME,
        }),
        signal,
    });

    const farcasterSession = new FarcasterSession(
        // not available
        '',
        // not available
        '',
        Date.now(),
        Date.now(),
        '',
        response.channelToken,
    );

    return {
        deeplink: response.connectUri,
        session: farcasterSession,
    };
}

export async function createSessionByGrantPermissionFirefly(callback?: (url: string) => void, signal?: AbortSignal) {
    const { deeplink, session } = await createChallengeFromFarcasterRelay(signal);

    // present QR code to the user or open the link in a new tab
    callback?.(deeplink);

    try {
        // firefly start polling for the signed key request
        // once key request is signed, we will get the fid
        const fireflySession = await FireflySession.from(session, signal);

        if (fireflySession) {
            // we also posses the session in firefly session holder
            // which means if we login in farcaster, we login firefly as well
            fireflySessionHolder.resumeSession(fireflySession);
        }
    } catch (error) {
        console.error(`[login farcaster] failed to restore firefly session: ${error}`);
    }

    return session;
}

/**
 * Initiates the creation of a session by granting data access permission to another FID.
 * @param signal
 * @returns
 */
export async function createSessionByGrantPermission(callback?: (url: string) => void, signal?: AbortSignal) {
    const { deeplink, session } = await createChallengeFromWarpcast(signal);

    // present QR code to the user or open the link in a new tab
    callback?.(deeplink);

    const query = async () => {
        const signedKeyResponse = await fetchJSON<ResponseJSON<SignedKeyRequestResponse>>(
            urlcat('/api/warpcast/signed-key', {
                token: session.signerRequestToken,
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

    const { result } = await queryTimes();
    if (result.signedKeyRequest.userFid) {
        session.profileId = `${result.signedKeyRequest.userFid}`;
        return session;
    }

    throw new Error('Failed to query the signed key request status after several attempts. Please try again later.');
}
