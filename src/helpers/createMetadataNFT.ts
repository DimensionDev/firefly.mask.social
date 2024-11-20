import { ChainId } from '@masknet/web3-shared-evm';

import { createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveCollectionChain } from '@/helpers/resolveCollectionChain.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { resolveWalletProfileProvider } from '@/helpers/resolveWalletProfileProvider.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import type { SimpleHashCollection } from '@/providers/types/WalletProfile.js';

export async function createMetadataNFT(address: string, tokenId: string, chainId: ChainId) {
    const provider = resolveWalletProfileProvider(chainId);
    const data = await provider
        .getNFT(
            address,
            tokenId,
            {
                chainId,
            },
            true,
        )
        .catch(() => null);
    if (!data?.metadata) return createSiteMetadata({});

    const title = createPageTitleOG(data.metadata.name);
    const description = data.metadata.description;
    const images = data.metadata.imageURL ? [data.metadata.imageURL] : [];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            url: resolveNftUrl(chainId, address),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    });
}

function createCollectionMetadata(data: SimpleHashCollection) {
    const title = createPageTitleOG(data.name);
    const description = data.description;
    const images = [data.image_url];
    const { chainId, address } = resolveCollectionChain(data);
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            url: resolveNftUrl(chainId, address),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    });
}

export async function createMetadataNFTCollection(address: string, chainId: ChainId) {
    const provider = resolveWalletProfileProvider(chainId);
    const data = await runInSafeAsync(() => provider.getCollection(address, { chainId }));
    if (!data) return createSiteMetadata({});

    return createCollectionMetadata(data);
}

export async function createMetadataNFTCollectionById(collectionId: string) {
    const provider = resolveWalletProfileProvider();
    const data = await runInSafeAsync(() => provider.getCollectionById(collectionId));
    if (!data) return createSiteMetadata({});

    return createCollectionMetadata(data);
}
