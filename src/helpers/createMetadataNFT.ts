import { ChainId } from '@masknet/web3-shared-evm';

import { createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveCollectionChain } from '@/helpers/resolveCollectionChain.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { SimpleHashProvider } from '@/providers/simplehash/index.js';
import type { SimpleHash } from '@/providers/types/SimpleHash.js';

export async function createMetadataNFT(address: string, tokenId: string, chainId: ChainId) {
    const data = await SimpleHashProvider.getNFT(
        address,
        tokenId,
        {
            chainId,
        },
        true,
    ).catch(() => null);
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

function createCollectionMetadata(data: SimpleHash.Collection) {
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
    const data = await runInSafeAsync(() => SimpleHashProvider.getCollection(address, { chainId }));
    if (!data) return createSiteMetadata({});

    return createCollectionMetadata(data);
}

export async function createMetadataNFTCollectionById(collectionId: string) {
    const data = await runInSafeAsync(() => SimpleHashProvider.getCollectionById(collectionId));
    if (!data) return createSiteMetadata({});

    return createCollectionMetadata(data);
}
