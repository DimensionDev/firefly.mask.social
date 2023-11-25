import { delay } from '@masknet/kit';
import urlcat from 'urlcat';

import { WARPCAST_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';

export function waitForSignedKeyRequestComplete(signal?: AbortSignal) {
    return async (token: string, maxTries = 100, ms = 2000) => {
        let tries = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (signal?.aborted) throw new Error('Aborted.');

            tries += 1;

            if (tries >= maxTries) throw new Error('Max tries reached.');

            // delay a while before checking again
            await delay(ms);

            const response = await fetchJSON<{
                result: { signedKeyRequest: { state: 'pending' | 'completed' | 'approved' } };
                errors?: Array<{ message: string }>;
            }>(
                urlcat(WARPCAST_ROOT_URL, '/signed-key-request', {
                    token,
                }),
            );

            if (response.errors?.length) continue;
            if (response.result.signedKeyRequest.state === 'completed') return true;
        }
    };
}
