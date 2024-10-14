import { ChainId } from '@masknet/web3-shared-evm';

import { createPageTitleOG } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export async function createMetadataNFT(address: string, tokenId: string, chainId: ChainId) {
    const data = await SimpleHashWalletProfileProvider.getNFT(
        address,
        tokenId,
        {
            chainId,
        },
        true,
    );
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

export async function createMetadataNFTCollection(address: string, chainId: ChainId) {
    const data = await SimpleHashWalletProfileProvider.getCollection(address, { chainId });
    if (!data) return createSiteMetadata({});
    const title = createPageTitleOG(data.name);
    const description = data.description;
    const images = [data.image_url];
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
