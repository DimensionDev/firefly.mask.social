import { ChainId } from '@masknet/web3-shared-evm';

/** native token id to the chain */
export const CoinIdToChainId: Record<string, ChainId> = {
    eth: ChainId.Mainnet,
    pol: ChainId.Polygon,
    bnb: ChainId.BSC,
    fantom: ChainId.Fantom,
    arbitrum: ChainId.Arbitrum,
    scroll: ChainId.Scroll,
    'avalanche-2': ChainId.Avalanche,
};
