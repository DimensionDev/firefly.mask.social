import { createLookupTableResolver } from '@masknet/shared-base';
import { getRPCConstant } from '@masknet/web3-shared-evm';
import { first } from 'lodash-es';
import { type Chain, createPublicClient as createClient, http, type PublicClient } from 'viem';
import { polygon } from 'viem/chains';

const resolvePublicProviderUrl = createLookupTableResolver<number, string>(
    {
        [polygon.id]: 'https://polygon-rpc.com',
    },
    '',
);

const map = new Map<number, PublicClient>();

export function createWagmiPublicClient(chain: Chain): PublicClient {
    const client = map.get(chain.id);
    if (client) return client;

    const providerUrl = resolvePublicProviderUrl(chain.id) ?? first(getRPCConstant(chain.id, 'RPC_URLS'));
    if (!providerUrl) throw new Error(`No provider url found for chain ${chain.id}`);

    const newClient = createClient({
        chain,
        transport: http(providerUrl),
    });
    map.set(chain.id, newClient);
    return newClient;
}
