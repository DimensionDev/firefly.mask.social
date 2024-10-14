import { notFound } from 'next/navigation.js';

import { NFTCollectionPage } from '@/app/(normal)/nft/pages/NFTCollectionPage.js';
import { createMetadataNFTCollection } from '@/helpers/createMetadataNFT.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { parseChainId } from '@/helpers/parseChainId.js';

interface Props {
    params: {
        address: string;
        chainId: string;
    };
}

export async function generateMetadata({ params: { address, ...params } }: Props) {
    const chainId = parseChainId(params.chainId);
    if (chainId) return createMetadataNFTCollection(address, chainId);
    return createSiteMetadata();
}

export default async function Page({ params: { address, ...params } }: Props) {
    const chainId = parseChainId(params.chainId);
    if (!chainId) notFound();

    return <NFTCollectionPage chainId={chainId} address={address} />
}
