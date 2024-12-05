import { createWalletClient, custom, type EIP1193Parameters, type Hex } from 'viem';
import { foundry } from 'viem/chains';

import { env } from '@/constants/env.js';

/**
 * Create a test wallet client with given response or request handler.
 * @param request
 * @returns
 */
export function createWagmiTestWalletClient(request: (payload: EIP1193Parameters) => Promise<unknown>) {
    return createWalletClient({
        transport: custom({
            request,
        }),
        chain: foundry,
        key: env.internal.VITE_ACCOUNT_KEY as Hex,
        account: env.internal.VITE_ACCOUNT as Hex,
    });
}
