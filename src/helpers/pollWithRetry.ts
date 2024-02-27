import { delay } from '@masknet/kit';

export async function pollingWithRetry<T>(callback: () => Promise<T>, times = 49, interval = 2000) {
    for (let i = 0; i < times; i += 1) {
        try {
            const receipt = await callback();
            if (!receipt) throw new Error('Not get result yet.');

            // the transaction has been confirmed
            return receipt;
        } catch {
            await delay(interval);
            continue;
        }
    }

    // insufficient try times
    throw new Error('Not get result yet.');
}
