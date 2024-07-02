import urlcat from 'urlcat';

import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import type { ResponseJSON } from '@/types/index.js';
import type { LinkDigested, OpenGraph } from '@/types/og.js';

class Loader extends BaseLoader<OpenGraph> {
    protected override fetch(url: string, signal?: AbortSignal) {
        return new Promise<OpenGraph | null>((resolve, reject) => {
            requestIdleCallback(async () => {
                try {
                    const timeout = AbortSignal.timeout(30_000);
                    const response = await fetchCachedJSON<ResponseJSON<LinkDigested>>(
                        urlcat('/api/oembed', { link: url }),
                        {
                            signal: signal ? anySignal(timeout, signal) : timeout,
                        },
                    );
                    if (response.success) resolve(response.data.og);
                    else resolve(null);
                } catch (error) {
                    console.error(`[og loader] fetch error: ${error}`);
                    reject(new Error('Failed to fetch open graph'));
                }
            });
        });
    }
}

export const OpenGraphLoader = new Loader();
