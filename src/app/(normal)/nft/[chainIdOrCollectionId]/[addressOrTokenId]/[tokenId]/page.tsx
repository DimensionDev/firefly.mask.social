import { notFound } from 'next/navigation.js';

import { NFTDetailPage } from '@/app/(normal)/nft/pages/NFTDetailPage.js';
import { createMetadataNFT } from '@/helpers/createMetadataNFT.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { parseChainId } from '@/helpers/parseChainId.js';

interface Props {
    params: {
        addressOrTokenId: string;
        tokenId: string;
        chainIdOrCollectionId: string;
    };
}

export async function generateMetadata({ params: { addressOrTokenId, tokenId, ...params } }: Props) {
    const chainId = parseChainId(params.chainIdOrCollectionId);
    if (chainId) return createMetadataNFT(addressOrTokenId, tokenId, chainId);
    return createSiteMetadata();
}

export default function Page({ params: { addressOrTokenId, tokenId, ...params } }: Props) {
    const chainId = parseChainId(params.chainIdOrCollectionId);
    if (!chainId) notFound();
    return <NFTDetailPage chainId={chainId} tokenId={tokenId} address={addressOrTokenId} />;
}
