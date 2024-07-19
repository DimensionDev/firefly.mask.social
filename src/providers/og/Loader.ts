import urlcat from 'urlcat';

import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import type { ResponseJSON } from '@/types/index.js';
import type { LinkDigested, OpenGraph } from '@/types/og.js';

class Loader extends BaseLoader<OpenGraph> {
    protected override fetch(url: string, signal?: AbortSignal) {
        return requestIdleCallbackAsync(async () => {
            const timeout = AbortSignal.timeout(30_000);
            const response = await fetchCachedJSON<ResponseJSON<LinkDigested>>(urlcat('/api/oembed', { link: url }), {
                signal: signal ? anySignal(timeout, signal) : timeout,
            });
            if (!response.success) throw new Error(response.error.message);
            return response.data.og;
        });
    }
}

export const OpenGraphLoader = new Loader();
