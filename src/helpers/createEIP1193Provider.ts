import { noop } from 'lodash-es';
import { getClient } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';

export interface RequestArguments {
    method: string;
    params: unknown[];
}

export function createEIP1193ProviderFromWagmi() {
    return {
        async request<T>(parameters: unknown): Promise<T> {
            const client = getClient(config);
            if (!client) throw new Error('Client not found');

            return client.request(parameters as Parameters<typeof client.request>[0]);
        },
        on: noop,
        removeListener: noop,
    };
}

export function createEIP1193ProviderFromRequest(request: <T>(requestArguments: RequestArguments) => Promise<T>) {
    return {
        async request<T>(parameters: unknown): Promise<T> {
            return request(parameters as Parameters<typeof request>[0]);
        },
        on: noop,
        removeListener: noop,
    };
}
