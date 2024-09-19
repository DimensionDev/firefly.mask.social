import { ChainId } from '@masknet/web3-shared-evm';

import { createPageTitleV2 } from '@/helpers/createPageTitle.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export async function getNFTCollectionOG(address: string, chainId: ChainId) {
    const data = await SimpleHashWalletProfileProvider.getCollection(address, { chainId });
    if (!data) return createSiteMetadata({});
    const title = createPageTitleV2(data.name);
    const description = data.description;
    const images = [data.image_url];
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
