import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';

export const resolveCoinGeckoChainId = createLookupTableResolver<string, number | undefined>(
    {
        ethereum: 1,
        'binance-smart-chain': 56,
        'polygon-pos': 137,
        solana: 101,
        astar: 592,
        aurora: 1313161554,
        avalanche: 43114,
        'arbitrum-nova': 42161,
        boba: 288,
        conflux: 1030,
        fantom: 250,
        fuse: 122,
        moonbeam: 1284,
        'optimistic-ethereum': 10,
        xdai: 100,
    },
    undefined,
);
