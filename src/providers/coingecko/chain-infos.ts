import type { Runtime } from '@/providers/types/Trending.js';

interface ChainInfo {
    name: string;
    runtime: Runtime;
    /** url of the icon*/
    icon: string;
}
export const chainInfos: ChainInfo[] = [
    {
        runtime: 'solana',
        name: 'Solana',
        icon: new URL('../../assets/chains/solana.png', import.meta.url).href,
    },
    {
        runtime: 'polkadot',
        name: 'Polkadot',
        icon: 'https://coin-images.coingecko.com/coins/images/12171/large/polkadot.png',
    },
    {
        runtime: 'stellar',
        name: 'Stellar',
        icon: 'https://coin-images.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png',
    },
    {
        runtime: 'near-protocol',
        name: 'Near',
        icon: 'https://coin-images.coingecko.com/coins/images/20582/large/aurora.jpeg',
    },
    {
        runtime: 'hedera-hashgraph',
        name: 'HashGraph',
        icon: 'https://coin-images.coingecko.com/coins/images/3688/large/hbar.png',
    },
    {
        runtime: 'zksync',
        name: 'ZKSync',
        icon: 'https://assets.coingecko.com/asset_platforms/images/121/small/zksync.jpeg?1706606814',
    },
    {
        runtime: 'tron',
        name: 'Tron',
        icon: 'https://coin-images.coingecko.com/coins/images/1094/large/tron-logo.png',
    },
    {
        runtime: 'arbitrum-one',
        name: 'Arbitrum-One',
        icon: new URL('../../assets/chains/arbitrum-one.png', import.meta.url).href,
    },
    {
        runtime: 'polygon-pos',
        name: 'Polygon-PoS',
        icon: 'https://coin-images.coingecko.com/coins/images/4713/large/polygon.png',
    },
    {
        runtime: 'flow',
        name: 'Flow',
        icon: new URL('../../assets/chains/flow.png', import.meta.url).href,
    },
    {
        runtime: 'celo',
        name: 'Celo',
        icon: 'https://coin-images.coingecko.com/coins/images/11090/large/InjXBNx9_400x400.jpg',
    },
    {
        runtime: 'the-open-network',
        name: 'Ton',
        icon: new URL('../../assets/chains/ton.png', import.meta.url).href,
    },
    {
        runtime: 'algorand',
        name: 'Algorand',
        icon: 'https://assets.coingecko.com/asset_platforms/images/3/small/algorand_logo_mark_black.png?1706606710',
    },
    {
        runtime: 'optimistic-ethereum',
        name: 'Optimistic-Ethereum',
        icon: new URL('../../assets/chains/optimism.png', import.meta.url).href,
    },
    {
        runtime: 'avalanche',
        name: 'Avalanche',
        icon: new URL('../../assets/chains/avalanche.png', import.meta.url).href,
    },
    {
        runtime: 'base',
        name: 'Base',
        icon: new URL('../../assets/chains/base.png', import.meta.url).href,
    },
    {
        runtime: 'kava',
        name: 'Kava',
        icon: 'https://assets.coingecko.com/asset_platforms/images/2/small/kava.jpeg?1707096364',
    },
];
