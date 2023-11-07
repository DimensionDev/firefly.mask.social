import urlcat from 'urlcat';
import { delay } from '@/helpers/delay';
import { fetchJSON } from '@/helpers/fetchJSON';
import { WARPCAST_ROOT_URL } from '@/constants';

export function waitForSignedKeyRequestComplete(signal?: AbortSignal) {
    return async (token: string, maxTries = 100, ms = 2000) => {
        let tries = 0;

        while (true) {
            if (signal?.aborted) throw new Error('Aborted.');
            if (tries++ >= maxTries) throw new Error('Max tries reached.');

            // delay a while before checking again
            await delay(ms);

            const response = await fetchJSON<{
                state: 'pending' | 'complete';
                errors?: Array<{ message: string }>;
            }>(
                urlcat(WARPCAST_ROOT_URL, '/signed-key-request', {
                    token,
                }),
            );

            console.log(`DEBUG: ${tries} check`);
            console.log(response);

            if (response.errors?.length) continue;
            if (response.state === 'complete') return true;
        }
    };
}
