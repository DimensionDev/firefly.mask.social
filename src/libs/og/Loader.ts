import urlcat from 'urlcat';

import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { BaseLoader } from '@/libs/base/Loader.js';
import type { ResponseJSON } from '@/types/index.js';
import type { LinkDigested, OpenGraph } from '@/types/og.js';

class Loader extends BaseLoader<OpenGraph> {
    protected override fetch(url: string) {
        return new Promise<OpenGraph | null>((resolve, reject) => {
            requestIdleCallback(async () => {
                try {
                    const response = await fetchCachedJSON<ResponseJSON<LinkDigested>>(
                        urlcat('/api/oembed', { link: url }),
                        {
                            signal: AbortSignal.timeout(30_000),
                        },
                        {
                            throwIfNotOK: true,
                        },
                    );
                    if (response.success) resolve(response.data.og);
                    else resolve(null);
                } catch {
                    reject(new Error('Failed to fetch OpenGraph'));
                }
            });
        });
    }
}

export const OpenGraphLoader = new Loader();
