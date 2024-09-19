import { ChainId } from '@masknet/web3-shared-evm';

import { createPageTitleV2 } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export async function getNFTPageOG(address: string, tokenId: string, chainId: ChainId) {
    const data = await SimpleHashWalletProfileProvider.getNFT(
        address,
        tokenId,
        {
            chainId,
        },
        true,
    );
    if (!data?.metadata) return createSiteMetadata({});
    const title = createPageTitleV2(data.metadata.name);
    const description = data.metadata.description;
    const images = data.metadata.imageURL ? [data.metadata.imageURL] : [];
    return createSiteMetadata({
        title,
        description,
        openGraph: {
            title,
            description,
            images,
            url: resolveNftUrl(address, { chainId }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images,
        },
    });
}
