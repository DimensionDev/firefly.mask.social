import { noop } from 'lodash-es';

import type { RequestArguments } from '@/types/ethereum.js';

export function createEIP1193Provider(request: (requestArguments: RequestArguments) => Promise<unknown>) {
    return {
        async request<T>(parameters: unknown): Promise<T> {
            return request(parameters as Parameters<typeof request>[0]) as Promise<T>;
        },
        on: noop,
        removeListener: noop,
    };
}
