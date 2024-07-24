import { type Chain, createPublicClient as createClient, http, type PublicClient } from 'viem';

import { resolveRPCUrl } from '@/helpers/resolveRPCUrl.js';

const map = new Map<number, PublicClient>();

export function createWagmiPublicClient(chain: Chain): PublicClient {
    const client = map.get(chain.id);
    if (client) return client;

    const providerUrl = resolveRPCUrl(chain.id);
    if (!providerUrl) throw new Error(`No provider url found for chain ${chain.id}`);

    const newClient = createClient({
        chain,
        transport: http(providerUrl),
    });
    map.set(chain.id, newClient);
    return newClient;
}
