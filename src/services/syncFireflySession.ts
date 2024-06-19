import urlcat from 'urlcat';

import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { SessionFactory } from '@/providers/base/SessionFactory.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { LensSession } from '@/providers/lens/Session.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import type { MetricsDownloadResponse, MetricsUploadResponse } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';
import type { ResponseJSON } from '@/types/index.js';

async function downloadMetrics(signal?: AbortSignal) {
    const response = await fireflySessionHolder.fetch<MetricsDownloadResponse>(
        urlcat(settings.FIREFLY_ROOT_URL, '/v1/metrics/download'),
        {
            signal,
        },
        true,
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
 * Decrypt firefly metrics.
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
    return response.data.map(SessionFactory.createSession);
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
 * Download and decrypt metrics from Firefly, then convert all to sessions.
 * @returns
 */
export async function downloadSessions(signal?: AbortSignal) {
    // Ensure that the Firefly session is resumed before calling this function.
    fireflySessionHolder.assertSession();

    const cipher = await downloadMetrics(signal);
    if (!cipher) return [];

    const sessions = await decryptMetrics(cipher, signal);
    return sessions as Array<FarcasterSession | LensSession | TwitterSession>;
}

/**
 * Encrypt sessions as metrics, and upload all to Firefly.
 * @param sessions
 * @param signal
 */
export async function uploadSessions(
    sessions: Array<FarcasterSession | LensSession | TwitterSession>,
    signal?: AbortSignal,
) {
    // Ensure that the Firefly session is resumed before calling this function.
    fireflySessionHolder.assertSession();

    const cipher = await encryptMetrics([], signal);
    await uploadMetrics(cipher, signal);
}
