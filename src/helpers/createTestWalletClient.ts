import { EIP1193Parameters, createWalletClient, custom } from 'viem';
import { foundry } from 'viem/chains';

/**
 * Create a test wallet client with given response or request handler.
 * @param request
 * @returns
 */
export function createTestWalletClient(request: (payload: EIP1193Parameters) => Promise<unknown>) {
    return createWalletClient({
        transport: custom({
            request,
        }),
        chain: foundry,
        key: process.env.VITE_ACCOUNT_KEY,
        account: process.env.VITE_ACCOUNT,
    });
}
