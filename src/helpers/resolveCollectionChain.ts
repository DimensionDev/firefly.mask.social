import { ChainId } from '@masknet/web3-shared-evm';
import { first } from 'lodash-es';

import { resolveSimpleHashChainId, resolveSimpleHashSolanaChainId } from '@/helpers/resolveSimpleHashChain.js';
import type { SimpleHashCollection } from '@/providers/types/WalletProfile.js';

export function resolveCollectionChain(collection: SimpleHashCollection): {
    address: string;
    chainId: number;
} {
    const address = collection.top_contracts?.[0]?.split('.')[1];
    const chainName = first(collection.chains);
    const evmChainId = chainName ? resolveSimpleHashChainId(chainName) : undefined;
    const solanaChainId = chainName && !evmChainId ? resolveSimpleHashSolanaChainId(chainName) : undefined;

    return {
        address,
        chainId: evmChainId || solanaChainId || ChainId.Mainnet,
    };
}
