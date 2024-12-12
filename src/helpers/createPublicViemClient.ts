import { createPublicClient, http, type PublicClient } from 'viem';

import { chains } from '@/configs/wagmiClient.js';
import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';

export function createPublicViemClient(chainId: number): PublicClient {
    const chain = chains.find((x) => x.id === chainId);
    if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);

    const client = createPublicClient({
        chain,
        transport: http(resolveRPCUrl(chainId), { batch: true }),
    });

    return client as PublicClient;
}
