/* cspell:disable */

import { ChainId } from '@masknet/web3-shared-evm';
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana';
import { first, memoize } from 'lodash-es';

const EVM_CHAIN: { [key in ChainId]?: string } = {
    [ChainId.Mainnet]: 'ethereum',
    [ChainId.Base]: 'base',
    [ChainId.BSC]: 'bsc',
    [ChainId.Polygon]: 'polygon',
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

const SOLANA_CHAIN: { [key in SolanaChainId]?: string } = {
    [SolanaChainId.Mainnet]: 'solana',
};

const EVM_CHAIN_ALIAS: Record<string, string> = {
    binance_smart_chain: 'bsc',
};

export function resolveSimpleHashChain(chain: ChainId) {
    return EVM_CHAIN[chain] ?? undefined;
}

function resolveInnerChainId<T extends number>(
    chains: Partial<Record<T, string>>,
    chain: string,
    chainAlias?: Record<string, string>,
) {
    const chainIdKey = first(Object.entries(chains).find(([, value]) => value === (chainAlias?.[chain] || chain)));
    return typeof chainIdKey === 'string' ? (parseInt(chainIdKey, 10) as T) : undefined;
}

export const resolveSimpleHashChainId: (chainId: string) => number | undefined = memoize(function resolveChainId(
    chain: string,
): number | undefined {
    const evmChainId = resolveInnerChainId<ChainId>(EVM_CHAIN, chain, EVM_CHAIN_ALIAS);
    if (evmChainId) return evmChainId;

    return resolveInnerChainId<SolanaChainId>(SOLANA_CHAIN, chain);
});
