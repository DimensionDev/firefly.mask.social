import { delay } from '@masknet/kit';

import { AbortError, InvalidResultError } from '@/constants/error.js';

interface Options {
    times?: number;
    interval?: number;
    signal?: AbortSignal;
}

export async function retry<T>(
    callback: (signal?: AbortSignal) => Promise<T>,
    { times = 60, interval = 2000, signal }: Options = {},
) {
    for (let i = 0; i < times; i += 1) {
        try {
            const result = await callback(signal);
            return result;
        } catch (error) {
            // continue if invalid result
            if (error instanceof InvalidResultError) {
                await delay(interval);
                continue;
            }

            // early return if aborted
            if (signal?.aborted) throw new AbortError();

            // rethrow other errors
            throw error;
        }
    }

    // insufficient try times
    throw new InvalidResultError();
}
