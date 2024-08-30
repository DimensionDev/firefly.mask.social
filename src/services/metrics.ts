import { safeUnreachable } from '@masknet/kit';
import dayjs from 'dayjs';
import { compact, groupBy } from 'lodash-es';
import urlcat from 'urlcat';

import { CryptoUsage } from '@/constants/enum.js';
import { AbortError, NotImplementedError, UnreachableError } from '@/constants/error.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getProfileBySession } from '@/helpers/getProfileBySession.js';
import { isSameSession } from '@/helpers/isSameSession.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import type { FireflySession } from '@/providers/firefly/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import type { Account } from '@/providers/types/Account.js';
import type { MetricsDownloadResponse, MetricsUploadResponse } from '@/providers/types/Firefly.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { settings } from '@/settings/index.js';
import type { ResponseJSON } from '@/types/index.js';

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

export async function downloadSessions(session: FireflySession, signal?: AbortSignal) {
    const cipher = await downloadMetrics(session, signal);
    if (!cipher) return [];

    return await decryptMetrics(cipher, signal);
}

async function uploadSessionsByMerge(session: FireflySession, sessions: Session[], signal?: AbortSignal) {
    const syncedSessions = await downloadSessions(session, signal);
    const noSyncedSessions = sessions.filter((x) => !syncedSessions.some((y) => isSameSession(x, y, true)));

    if (noSyncedSessions.length) {
        console.warn(`[uploadSessionsByMerge] ${noSyncedSessions.length} sessions are not synced.`);
    }

    const mergedSessions = Object.values(
        groupBy([...syncedSessions, ...noSyncedSessions], (x) => `${x.type}:${x.profileId}`),
    )
        .map((group) => {
            if (group.length === 1) {
                const [a] = group;
                return a;
            }
            // TODO: merge the same sessions
            if (group.length === 2) {
                const [a, b] = group;
                if (dayjs(b.createdAt).isBefore(a.createdAt)) return a;

                return b;
            }
            throw new Error('Not available group length.');
        })
        .filter((x) => {
            switch (x.type) {
                case SessionType.Farcaster:
                    return /^0x[a-f0-9]{64}$/.test(x.token);
                case SessionType.Lens:
                    return true;
                case SessionType.Twitter:
                    return true;
                case SessionType.Firefly:
                    return false;
                default:
                    safeUnreachable(x.type);
                    throw new UnreachableError('session type', x);
            }
        });

    await uploadSessionByOverride(session, mergedSessions, signal);
}

async function uploadSessionByOverride(session: FireflySession, sessions: Session[], signal?: AbortSignal) {
    const cipher = await encryptMetrics(session, sessions, signal);
    await uploadMetrics(cipher, signal);
}

export function uploadSessions(
    strategy: 'merge' | 'override',
    session: FireflySession,
    sessions: Session[],
    signal?: AbortSignal,
) {
    switch (strategy) {
        case 'merge':
            return uploadSessionsByMerge(session, sessions, signal);
        case 'override':
            return uploadSessionByOverride(session, sessions, signal);
        default:
            safeUnreachable(strategy);
            throw new UnreachableError('strategy', strategy);
    }
}

/**
 * Download and decrypt metrics from Firefly, then convert them to accounts.
 * @returns
 */
export async function downloadAccounts(session: FireflySession, signal?: AbortSignal) {
    const sessions = await downloadSessions(session, signal);

    // validate and convert session to profile
    const allSettled = await Promise.allSettled(sessions.map((x) => getProfileBySession(x, signal)));

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
