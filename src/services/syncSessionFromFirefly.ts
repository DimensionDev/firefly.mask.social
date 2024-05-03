import { first } from 'lodash-es';
import urlcat from 'urlcat';

import type { FarcasterMetric, LensMetric, Metrics } from '@/app/api/firefly/decrypt-metrics/route.js';
import { FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveFireflyResponseData } from '@/helpers/resolveFireflyResponseData.js';
import { FarcasterSession } from '@/providers/farcaster/Session.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { LensSession } from '@/providers/lens/Session.js';
import type { MetricsDownloadResponse } from '@/providers/types/Firefly.js';
import type { ResponseJSON } from '@/types/index.js';

/**
 * Download encrypted metrics from Firefly.
 * @param session
 * @returns
 */
async function downloadMetricsFromFirefly() {
    const response = await fireflySessionHolder.fetch<MetricsDownloadResponse>(
        urlcat(FIREFLY_ROOT_URL, '/v1/metrics/download'),
        {
            method: 'GET',
        },
        true,
    );
    const data = resolveFireflyResponseData(response);
    return data?.ciphertext;
}

async function decryptMetricsFromFirefly(cipher: string) {
    const response = await fetchJSON<ResponseJSON<Metrics>>('/api/firefly/decrypt-metrics', {
        method: 'POST',
        body: JSON.stringify({ text: cipher }),
    });
    if (!response.success) return [];
    return response.data;
}

function convertMetricToSession(metric: Metrics[0]) {
    const farcasterMetric = metric as FarcasterMetric;
    const lensMetric = metric as LensMetric;

    // for farcaster metric has fid
    if (typeof first(farcasterMetric.login_metadata)?.fid === 'number') {
        return farcasterMetric.login_metadata.map((x) => {
            // the signerRequestToken cannot recover from the metric
            // but it is necessary for distinguish grant by permission session
            // so we use a fake token here
            return new FarcasterSession(
                `${x.fid}`,
                x.signer_private_key,
                x.login_time,
                x.login_time,
                'fake_signer_request_token',
            );
        });
        // for lens metric has profile_id
    } else if (typeof first(lensMetric.login_metadata)?.profile_id === 'string') {
        return lensMetric.login_metadata.map((x) => {
            return new LensSession(x.profile_id, x.token, x.login_time, x.login_time, x.refresh_token);
        });
    } else {
        return [];
    }
}

/**
 * Make sure resume firefly session before calling this function.
 * @returns
 */
export async function syncSessionFromFirefly() {
    const cipher = await downloadMetricsFromFirefly();
    if (!cipher) return [];

    const metrics = await decryptMetricsFromFirefly(cipher);
    return metrics.flatMap<FarcasterSession | LensSession>(convertMetricToSession);
}
