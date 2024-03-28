import urlcat from 'urlcat';

import { MAX_OG_SIZE_PER_POST } from '@/constants/index.js';
import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { BaseLoader } from '@/libs/base/Loader.js';
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
                        {
                            throwIfNotOK: true,
                        },
                    );
                    if (response.success) resolve(response.data.og);
                    else resolve(null);
                } catch {
                    reject(new Error('Failed to fetch open graph'));
                }
            });
        });
    }

    protected override parse(content: string) {
        return super.parse(content).slice(0, MAX_OG_SIZE_PER_POST);
    }
}

export const OpenGraphLoader = new Loader();
