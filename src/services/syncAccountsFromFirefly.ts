import { safeUnreachable } from '@masknet/kit';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { AbortError, NotAllowedError, UnreachableError } from '@/constants/error.js';
import { createLensSDKForSession, MemoryStorageProvider } from '@/helpers/createLensSDK.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { isSameAccount } from '@/helpers/isSameAccount.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { Account } from '@/providers/types/Account.js';
import type { MetricsDownloadResponse, MetricsUploadResponse } from '@/providers/types/Firefly.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { settings } from '@/settings/index.js';
import type { ResponseJSON } from '@/types/index.js';

async function downloadMetrics(session: FireflySession, signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetchWithSession(session)<MetricsDownloadResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v1/metrics/download'),
        {
            signal,
        },
    );
    const data = resolveFireflyResponseData(response);
    return data?.ciphertext;
}

async function uploadMetrics(cipher: string, signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetch<MetricsUploadResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v1/metrics/upload'),
        {
            body: JSON.stringify({ ciphertext: cipher }),
            signal,
        },
        true,
    );
    const data = resolveFireflyResponseData(response);
    return;
}

/**
 * Decrypt the metrics from Firefly.
 * @param cipher
 * @param signal
 * @returns
 */
async function decryptMetrics(cipher: string, signal?: AbortSignal) {
    const response = await fetchJSON<ResponseJSON<string[]>>('/api/firefly/metrics', {
        method: 'POST',
        body: JSON.stringify({
            usage: 'decrypt',
            text: cipher,
        }),
        signal,
    });
    if (!response.success) throw new Error(response.error.message);
    return response.data.map(SessionFactory.createSession) as Array<FarcasterSession | LensSession | TwitterSession>;
}

/**
 * Encrypt firefly metrics.
 * @param sessions
 * @param signal
 * @returns
 */
async function encryptMetrics(sessions: Array<FarcasterSession | LensSession | TwitterSession>, signal?: AbortSignal) {
    const response = await fetchJSON<ResponseJSON<string>>('/api/firefly/metrics', {
        method: 'POST',
        body: JSON.stringify({
            usage: 'encrypt',
            text: sessions.map((x) => x.serialize()),
        }),
        signal,
    });
    if (!response.success) throw new Error(response.error.message);
    return response.data;
}

/**
 * Download and decrypt metrics from Firefly, then convert them to accounts.
 * @returns
 */
export async function downloadAccounts(session: FireflySession, signal?: AbortSignal) {
    const cipher = await downloadMetrics(session, signal);
    if (!cipher) return [];

    const sessions = await decryptMetrics(cipher, signal);

    // validate and convert session to profile
    const allSettled = await Promise.allSettled(
        sessions.map(async (x) => {
            switch (x.type) {
                case SessionType.Twitter: {
                    const twitterSession = x as TwitterSession;
                    return TwitterSocialMediaProvider.getProfileByIdWithSessionPayload(
                        x.profileId,
                        twitterSession.payload,
                    );
                }
                case SessionType.Lens: {
                    const lensSession = x as LensSession;
                    if (!lensSession.refreshToken) return null;

                    const sdk = createLensSDKForSession(new MemoryStorageProvider(), lensSession);
                    const profileId = await sdk.authentication.getProfileId();
                    if (!profileId) return null;

                    const provider = resolveSocialMediaProvider(Source.Lens);
                    return provider.getProfileById(x.profileId);
                }
                case SessionType.Farcaster:
                    const provider = resolveSocialMediaProvider(Source.Farcaster);
                    return provider.getProfileById(x.profileId);
                case SessionType.Firefly:
                    throw new NotAllowedError();
                default:
                    safeUnreachable(x.type);
                    throw new UnreachableError('session type', x);
            }
        }),
    );

    // check if the request is aborted
    if (signal?.aborted) throw new AbortError();

    const accounts = compact<Account>(
        allSettled.map((x, i) =>
            x.status === 'fulfilled' && x.value
                ? {
                      profile: x.value,
                      session: sessions[i],
                      fireflySession: session,
                  }
                : null,
        ),
    );

    return accounts.filter((x) => {
        const state = getProfileState(x.profile.source);
        return !state.accounts.find((y) => isSameAccount(x, y));
    });
}

export async function uploadAccounts(session: FireflySession, accounts: Account[], signal?: AbortSignal) {
    // Ensure that the Firefly session is resumed before calling this function.
    fireflySessionHolder.assertSession();

    const cipher = await encryptMetrics([], signal);
    await uploadMetrics(cipher, signal);
}
