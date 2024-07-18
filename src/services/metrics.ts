import { safeUnreachable } from '@masknet/kit';
import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { CryptoUsage, Source } from '@/constants/enum.js';
import { AbortError, NotAllowedError, NotImplementedError, UnreachableError } from '@/constants/error.js';
import { createLensSDKForSession, MemoryStorageProvider } from '@/helpers/createLensSDK.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { isSameSession } from '@/helpers/isSameSession.js';
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
import type { Session } from '@/providers/types/Session.js';
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
            method: 'POST',
            body: JSON.stringify({ ciphertext: cipher }),
            signal,
        },
        true,
    );
    const data = resolveFireflyResponseData(response);
    return data;
}

/**
 * Encrypt sessions as firefly metrics.
 * @param sessions
 * @param signal
 * @returns
 */
async function encryptMetrics(session: FireflySession, sessions: Session[], signal?: AbortSignal) {
    const response = await fetchJSON<ResponseJSON<string>>('/api/firefly/metrics', {
        method: 'POST',
        body: JSON.stringify({
            accountId: session.profileId,
            usage: CryptoUsage.Encrypt,
            sessions: sessions.map((x) => x.serialize()),
        }),
        signal,
    });
    if (!response.success) throw new Error(response.error.message);
    return response.data;
}

/**
 * Decrypt firefly metrics to sessions.
 * @param cipher
 * @param signal
 * @returns
 */
async function decryptMetrics(cipher: string, signal?: AbortSignal) {
    const response = await fetchJSON<ResponseJSON<string[]>>('/api/firefly/metrics', {
        method: 'POST',
        body: JSON.stringify({
            usage: CryptoUsage.Decrypt,
            cipher,
        }),
        signal,
    });
    if (!response.success) throw new Error(response.error.message);
    return response.data.map(SessionFactory.createSession) as Session[];
}

async function convertSessionToProfile(session: Session, signal?: AbortSignal) {
    switch (session.type) {
        case SessionType.Twitter: {
            const twitterSession = session as TwitterSession;
            return TwitterSocialMediaProvider.getProfileByIdWithSessionPayload(
                twitterSession.profileId,
                twitterSession.payload,
            );
        }
        case SessionType.Lens: {
            const lensSession = session as LensSession;
            if (!lensSession.refreshToken) return null;

            const sdk = createLensSDKForSession(new MemoryStorageProvider(), lensSession);
            const profileId = await sdk.authentication.getProfileId();
            if (!profileId) return null;

            const provider = resolveSocialMediaProvider(Source.Lens);
            return provider.getProfileById(lensSession.profileId);
        }
        case SessionType.Farcaster:
            const farcasterSession = session as FarcasterSession;
            const provider = resolveSocialMediaProvider(Source.Farcaster);
            return provider.getProfileById(farcasterSession.profileId);
        case SessionType.Firefly:
            throw new NotAllowedError();
        default:
            safeUnreachable(session.type);
            throw new UnreachableError('session type', session);
    }
}

export async function downloadSessions(session: FireflySession, signal?: AbortSignal) {
    const cipher = await downloadMetrics(session, signal);
    if (!cipher) return [];

    return await decryptMetrics(cipher, signal);
}

export async function uploadSessions(session: FireflySession, sessions: Session[], signal?: AbortSignal) {
    const syncedSessions = await downloadSessions(session, signal);
    const noSyncedSessions = sessions.filter((x) => !syncedSessions.some((y) => isSameSession(x, y)));
    if (!noSyncedSessions.length) {
        console.warn('[uploadSessions] No new sessions to upload.');
        return;
    }

    const cipher = await encryptMetrics(session, [...syncedSessions, ...noSyncedSessions], signal);
    await uploadMetrics(cipher, signal);
}

/**
 * Download and decrypt metrics from Firefly, then convert them to accounts.
 * @returns
 */
export async function downloadAccounts(session: FireflySession, signal?: AbortSignal) {
    const sessions = await downloadSessions(session, signal);

    // validate and convert session to profile
    const allSettled = await Promise.allSettled(sessions.map((x) => convertSessionToProfile(x, signal)));

    // check if the request is aborted
    if (signal?.aborted) throw new AbortError();

    return compact<Account>(
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
}

export async function uploadAccounts(session: FireflySession, accounts: Account[], signal?: AbortSignal) {
    throw new NotImplementedError('Use uploadSessions() instead.');
}
