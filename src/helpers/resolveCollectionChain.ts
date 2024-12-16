import { ChainId } from '@masknet/web3-shared-evm';
import { first } from 'lodash-es';

import { resolveSimpleHashChainId } from '@/helpers/resolveSimpleHashChain.js';
import type { SimpleHash } from '@/providers/simplehash/type.js';

export function resolveCollectionChain(collection: SimpleHash.Collection): {
    address: string;
    chainId: number;
} {
    const address = collection.top_contracts?.[0]?.split('.')[1];
    const chainName = first(collection.chains);
    const chainId = chainName ? resolveSimpleHashChainId(chainName) : undefined;

    return {
        address,
        chainId: chainId || ChainId.Mainnet,
    };
}
