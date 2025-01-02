import { noop } from 'lodash-es';

import { config } from '@/configs/wagmiClient.js';
import { EthereumMethodType } from '@masknet/web3-shared-evm';
import { switchEthereumChain } from '@/helpers/switchEthereumChain.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';

async function hanldeRequest(parameters: RequestArguments) {
    const { method, params } = parameters;
    const client = await getWalletClientRequired(config);

    switch (method) {
        case EthereumMethodType.ETH_REQUEST_ACCOUNTS:
            return [client.account.address];
        case EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN:
            const chain = params[0] as { chainId: string };
            const chainId = Number.parseInt(chain.chainId, 16);
            await switchEthereumChain(chainId);
            return;
        default:
            return client.request(parameters as Parameters<typeof client.request>[0]);
    }
}

export interface RequestArguments {
    method: string;
    params: unknown[];
}

export function createEIP1193ProviderFromWagmi() {
    return {
        async request<T>(parameters: unknown): Promise<T> {
            console.log('DEBUG: createEIP1193ProviderFromWagmi -> parameters', parameters);

            const result = await hanldeRequest(parameters as RequestArguments);

            console.log('DEBUG: createEIP1193ProviderFromWagmi -> result', result);

            return result as T;
        },
        on: noop,
        removeListener: noop,
    };
}

export function createEIP1193ProviderFromRequest(request: <T>(requestArguments: RequestArguments) => Promise<T>) {
    return {
        async request<T>(parameters: unknown): Promise<T> {
            console.log('DEBUG: createEIP1193ProviderFromRequest -> parameters', parameters);

            return request(parameters as Parameters<typeof request>[0]);
        },
        on: noop,
        removeListener: noop,
    };
}
