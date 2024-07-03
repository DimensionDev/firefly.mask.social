import urlcat from 'urlcat';

import { anySignal } from '@/helpers/anySignal.js';
import { fetchCachedJSON } from '@/helpers/fetchJSON.js';
import { parseJSON } from '@/helpers/parseJSON.js';
import { requestIdleCallbackAsync } from '@/helpers/requestIdleCallbackAsync.js';
import { BaseLoader } from '@/providers/base/Loader.js';
import type { Action, ActionScheme } from '@/types/blink.js';
import type { ResponseJSON } from '@/types/index.js';

class Loader extends BaseLoader<Action> {
    protected override fetch(scheme: string, signal?: AbortSignal): Promise<Action | null> {
        return requestIdleCallbackAsync(async () => {
            const timeout = AbortSignal.timeout(30_000);
            const response = await fetchCachedJSON<ResponseJSON<Action>>(
                urlcat('/api/solana/action', parseJSON<ActionScheme>(scheme) ?? {}),
                {
                    signal: signal ? anySignal(timeout, signal) : timeout,
                    method: 'GET',
                },
            );
            if (!response.success) throw new Error(response.error.message);
            return response.data;
        });
    }

    public fetchAction(scheme: ActionScheme) {
        return this.fetch(JSON.stringify(scheme, ['type', 'url', 'blink']));
    }
}

export const BlinkLoader = new Loader();
