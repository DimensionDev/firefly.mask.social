/* cspell:disable */

import { ChainId } from '@masknet/web3-shared-evm';

const EVM_CHAIN: { [key in ChainId]?: string } = {
    [ChainId.Mainnet]: 'ethereum',
    [ChainId.BSC]: 'bsc',
    [ChainId.Matic]: 'polygon',
    [ChainId.Arbitrum]: 'arbitrum',
    [ChainId.Optimism]: 'optimism',
    [ChainId.Avalanche]: 'avalanche',
    [ChainId.xDai]: 'gnosis',
    [ChainId.Base]: 'base',
    [ChainId.Scroll]: 'scroll',
    [ChainId.Celo]: 'celo',
    [ChainId.Zora]: 'zora',
    [ChainId.ZkSyncEra]: 'zksync-era',
    [ChainId.Linea]: 'linea',
};

export function resolveSimpleHashChain(chain: ChainId) {
    return EVM_CHAIN[chain] ?? undefined;
}
