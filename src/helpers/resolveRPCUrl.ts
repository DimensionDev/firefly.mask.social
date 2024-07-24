import { getRPCConstant } from '@masknet/web3-shared-evm';
import { first } from 'lodash-es';
import { polygon } from 'viem/chains';

import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

const resolvePublicProviderUrl = createLookupTableResolver<number, string>(
    {
        [polygon.id]: 'https://polygon-rpc.com',
    },
    '',
);

export function resolveRPCUrl(chainId: number) {
    return resolvePublicProviderUrl(chainId) || first(getRPCConstant(chainId, 'RPC_URLS'));
}
