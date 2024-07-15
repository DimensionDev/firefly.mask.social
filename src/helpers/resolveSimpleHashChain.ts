/* cspell:disable */

import { first, memoize } from 'lodash-es';

import { ChainId } from '@/constants/ethereum.js';

const EVM_CHAIN: { [key in ChainId]?: string } = {
    [ChainId.Mainnet]: 'ethereum',
    [ChainId.Base]: 'base',
    [ChainId.BSC]: 'bsc',
    [ChainId.Degen]: 'degen',
    [ChainId.Polygon]: 'polygon',
    [ChainId.Optimism]: 'optimism',
    [ChainId.Arbitrum]: 'arbitrum',
    [ChainId.Gnosis]: 'gnosis',
    [ChainId.Aurora]: 'aurora',
    [ChainId.Avalanche]: 'avalanche',
    [ChainId.Zora]: 'zora',
};

export function resolveSimpleHashChain(chain: ChainId) {
    return EVM_CHAIN[chain] ?? undefined;
}

export const resolveSimpleHashChainId: (chainId: string) => ChainId | undefined = memoize(function resolveChainId(
    chain: string,
): ChainId | undefined {
    const chainIdKey = first(Object.entries(EVM_CHAIN).find(([, value]) => value === chain));
    return typeof chainIdKey === 'string' ? (parseInt(chainIdKey, 10) as ChainId) : undefined;
});
