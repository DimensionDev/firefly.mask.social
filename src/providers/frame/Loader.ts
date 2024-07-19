import urlcat from 'urlcat';

import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import type { Frame, LinkDigestedResponse } from '@/types/frame.js';
import type { ResponseJSON } from '@/types/index.js';

class Loader extends BaseLoader<Frame> {
    protected override fetch(url: string, signal?: AbortSignal) {
        return requestIdleCallbackAsync(async () => {
            const timeout = AbortSignal.timeout(30_000);
            const response = await fetchCachedJSON<ResponseJSON<LinkDigestedResponse>>(
                urlcat('/api/frame', { link: url }),
                {
                    signal: signal ? anySignal(timeout, signal) : timeout,
                },
            );
            if (!response.success) throw new Error(response.error.message);
            return response.data.frame;
        });
    }
}

export const FrameLoader = new Loader();
