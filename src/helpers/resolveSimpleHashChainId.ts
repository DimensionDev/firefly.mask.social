/* cspell:disable */

import { ChainId } from '@masknet/web3-shared-evm';
import { memoize } from 'lodash-es';

export const resolveSimpleHashChainId: (chainId: string) => ChainId | undefined = memoize(function resolveChainId(
    chain: string,
): ChainId | undefined {
    // Some of the `chainResolver.chainId()` results do not match.
    switch (chain) {
        case 'ethereum':
            return ChainId.Mainnet;
        case 'polygon':
            return ChainId.Matic;
        case 'arbitrum':
            return ChainId.Arbitrum;
        case 'optimism':
            return ChainId.Optimism;
        case 'avalanche':
            return ChainId.Avalanche;
        case 'gnosis':
            return ChainId.xDai;
        case 'bsc':
            return ChainId.BSC;
        case 'base':
            return ChainId.Base;
        case 'scroll':
            return ChainId.Scroll;
        case 'celo':
            return ChainId.Celo;
        default:
            return undefined;
    }
});
