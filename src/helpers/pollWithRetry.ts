import { delay } from '@masknet/kit';

interface Options {
    times?: number;
    interval?: number;
    signal?: AbortSignal;
}

export async function pollingWithRetry<T>(
    callback: (signal?: AbortSignal) => Promise<T>,
    { times = 60, interval = 2000, signal }: Options = {},
) {
    for (let i = 0; i < times; i += 1) {
        try {
            const result = await callback(signal);
            if (!result) throw new Error('Not get result yet.');
            return result;
        } catch {
            await delay(interval);
            continue;
        }
    }

    // insufficient try times
    throw new Error('Not get result yet.');
}
