import { useAsyncRetry } from 'react-use';

import { InvalidResultError } from '@/constants/error.js';
import { retry } from '@/helpers/retry.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export function useFireflyBridgeSupported(signal?: AbortSignal) {
    return useAsyncRetry(async () => {
        return retry(
            async () => {
                if (!fireflyBridgeProvider.supported) throw new InvalidResultError();
                return true;
            },
            {
                times: 5,
                interval: 300,
                signal,
            },
        );
    }, [signal]);
}
