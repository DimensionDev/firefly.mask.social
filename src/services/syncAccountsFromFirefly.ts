import { compact } from 'lodash-es';
import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getProfileState } from '@/helpers/getProfileState.js';
import { isSameAccount } from '@/helpers/isSameAccount.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSourceFromSessionType } from '@/helpers/resolveSource.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import type { MetricsDownloadResponse } from '@/providers/types/Firefly.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import { settings } from '@/settings/index.js';
import type { ResponseJSON } from '@/types/index.js';
import type { FireflySession } from '@/providers/firefly/Session.js';

/**
 * Download encrypted metrics from Firefly.
 * @param session
 * @returns
 */
async function downloadMetricsFromFirefly(session: FireflySession, signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetchWithSession(session)<MetricsDownloadResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v1/metrics/download'),
        {
            signal,
        },
    );
    const data = resolveFireflyResponseData(response);
    return data?.ciphertext;
}

/**
 * Decrypt the metrics from Firefly.
 * @param cipher
 * @param signal
 * @returns
 */
async function decryptMetricsFromFirefly(cipher: string, signal?: AbortSignal) {
    const response = await fetchJSON<ResponseJSON<string[]>>('/api/firefly/decrypt-metrics', {
        method: 'POST',
        body: JSON.stringify({ text: cipher }),
        signal,
    });
    if (!response.success) throw new Error(response.error.message);
    return response.data.map(SessionFactory.createSession) as Array<FarcasterSession | LensSession | TwitterSession>;
}

/**
 * Download and decrypt metrics from Firefly, then convert them to accounts.
 * @returns
 */
export async function syncAccountsFromFirefly(session: FireflySession, signal?: AbortSignal) {
    const cipher = await downloadMetricsFromFirefly(session, signal);
    if (!cipher) return [];

    const sessions = await decryptMetricsFromFirefly(cipher, signal);

    // convert session to profile
    const allSettled = await Promise.allSettled(
        sessions.map((x) => {
            if (x.type === SessionType.Twitter) {
                const session = x as TwitterSession;
                return TwitterSocialMediaProvider.getProfileByIdWithSessionPayload(x.profileId, session.payload);
            }
            const provider = resolveSocialMediaProvider(resolveSocialSourceFromSessionType(x.type));
            return provider.getProfileById(x.profileId);
        }),
    );
    const accounts = compact(
        allSettled.map((x, i) =>
            x.status === 'fulfilled' && x.value
                ? {
                      profile: x.value,
                      session: sessions[i],
                  }
                : null,
        ),
    );

    return accounts.filter((x) => {
        const state = getProfileState(x.profile.source);
        return !state.accounts.find((y) => isSameAccount(x, y));
    });
}
