/* cspell:disable */

import { ChainId } from '@masknet/web3-shared-evm';
import { first, memoize } from 'lodash-es';

const EVM_CHAIN: { [key in ChainId]?: string } = {
    [ChainId.Mainnet]: 'ethereum',
    [ChainId.Base]: 'base',
    [ChainId.BSC]: 'bsc',
    [ChainId.Matic]: 'polygon',
    [ChainId.Arbitrum]: 'arbitrum',
    [ChainId.Optimism]: 'optimism',
    [ChainId.Avalanche]: 'avalanche',
    [ChainId.xDai]: 'gnosis',
    [ChainId.Scroll]: 'scroll',
    [ChainId.Celo]: 'celo',
    [ChainId.Zora]: 'zora',
    [ChainId.ZkSyncEra]: 'zksync-era',
    [ChainId.Linea]: 'linea',
};

const EVM_CHAIN_ALIAS: Record<string, string> = {
    'binance_smart_chain': 'bsc'
}

export function resolveSimpleHashChain(chain: ChainId) {
    return EVM_CHAIN[chain] ?? undefined;
}

export const resolveSimpleHashChainId: (chainId: string) => ChainId | undefined = memoize(function resolveChainId(
    chain: string,
): ChainId | undefined {
    const chainIdKey = first(Object.entries(EVM_CHAIN).find(([, value]) => value === (EVM_CHAIN_ALIAS[chain] || chain)));
    return typeof chainIdKey === 'string' ? (parseInt(chainIdKey, 10) as ChainId) : undefined;
});
