import urlcat from 'urlcat';

import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import type { MetricsDownloadResponse } from '@/providers/types/Firefly.js';
import type { ResponseJSON } from '@/types/index.js';

/**
 * Download encrypted metrics from Firefly.
 * @param session
 * @returns
 */
async function downloadMetricsFromFirefly(signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetch<MetricsDownloadResponse>(
        urlcat(FIREFLY_ROOT_URL, '/v1/metrics/download'),
        {
            signal,
        },
        true,
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
    return response.data.map(SessionFactory.createSession);
}

/**
 * Download and decrypt metrics from Firefly, then convert them to sessions.
 * @returns
 */
export async function syncSessionFromFirefly(signal?: AbortSignal) {
    // Ensure that the Firefly session is resumed before calling this function.
    fireflySessionHolder.assertSession();

    const cipher = await downloadMetricsFromFirefly(signal);
    if (!cipher) return [];

    const sessions = await decryptMetricsFromFirefly(cipher, signal);
    return sessions as Array<FarcasterSession | LensSession | TwitterSession>;
}
