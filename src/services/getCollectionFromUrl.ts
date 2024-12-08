import { ChainId as ChainIdEVM } from '@masknet/web3-shared-evm';
import { ChainId as ChainIdSolana, isValidChainId as isSolanaChainId } from '@masknet/web3-shared-solana';

import { NetworkType, NFTMarketplace } from '@/constants/enum.js';
import { parseUrl } from '@/helpers/parseUrl.js';
import { SimpleHashProvider } from '@/providers/simplehash/index.js';

const rules: Array<{
    hosts: string[];
    pathname: RegExp;
    network: NetworkType;
    chainId: number;
    provider: NFTMarketplace;
}> = [
    // https://opensea.io/collection/lens-protocol-profiles
    {
        hosts: ['opensea.io'],
        pathname: /^\/collection\/([^/]+)$/,
        network: NetworkType.Ethereum,
        chainId: ChainIdEVM.Mainnet,
        provider: NFTMarketplace.Opensea,
    },
    // https://magiceden.us/marketplace/retardio_cousins
    {
        hosts: ['magiceden.io', 'magiceden.us'],
        pathname: /^\/marketplace\/([^/]+)$/,
        network: NetworkType.Solana,
        chainId: ChainIdSolana.Mainnet,
        provider: NFTMarketplace.Magiceden,
    },
    // https://blur.io/collection/azuki
    {
        hosts: ['blur.io'],
        pathname: /^\/collection\/([^/]+)$/,
        network: NetworkType.Ethereum,
        chainId: ChainIdEVM.Mainnet,
        provider: NFTMarketplace.Opensea,
    },
];

const simpleHashChains = [
    'ethereum',
    'base',
    'bsc',
    'polygon',
    'arbitrum',
    'optimism',
    'avalanche',
    'gnosis',
    'scroll',
    'celo',
    'zora',
    'zksync-era',
    'linea',
];

function resolveMarketplaceData(url: string) {
    const parsed = parseUrl(url);
    if (!parsed) return null;

    const { hostname, pathname } = parsed;

    for (const rule of rules) {
        const isHostMatched = rule.hosts.includes(hostname);
        const matched = rule.pathname && pathname.match(rule.pathname);

        if (isHostMatched && matched) {
            return {
                chainId: rule.chainId,
                provider: rule.provider,
                network: rule.network,
                slug: matched[1],
            };
        }
    }

    return null;
}

export async function getCollectionFromUrl(url: string) {
    const marketplaceData = resolveMarketplaceData(url);
    if (!marketplaceData) return null;

    const chain = isSolanaChainId(marketplaceData.chainId) ? 'solana' : simpleHashChains.join(',');
    const response = await SimpleHashProvider.getNFTCollectionsByMarket({
        marketplace: marketplaceData.provider,
        slugs: marketplaceData.slug,
        chains: chain,
    });

    return response.data[0];
}
