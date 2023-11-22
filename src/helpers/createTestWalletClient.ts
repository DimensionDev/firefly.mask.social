import { createWalletClient, custom, type EIP1193Parameters } from 'viem';
import { foundry } from 'viem/chains';
import type { WalletClient } from 'wagmi';

/**
 * Create a test wallet client with given response or request handler.
 * @param request
 * @returns
 */
export function createTestWalletClient(request: (payload: EIP1193Parameters) => Promise<unknown>): WalletClient {
    return createWalletClient({
        transport: custom({
            request,
        }),
        chain: foundry,
        key: process.env.VITE_ACCOUNT_KEY,
        account: process.env.VITE_ACCOUNT,
    });
}
