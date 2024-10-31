import { notFound } from 'next/navigation.js';

import { NFTDetailPage } from '@/app/(normal)/nft/pages/NFTDetailPage.js';
import { createMetadataNFT } from '@/helpers/createMetadataNFT.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { parseChainId } from '@/helpers/parseChainId.js';

interface Props {
    params: {
        address: string;
        tokenId: string;
        chainId: string;
    };
}

export async function generateMetadata({ params: { address, tokenId, ...params } }: Props) {
    const chainId = parseChainId(params.chainId);
    if (chainId) return createMetadataNFT(address, tokenId, chainId);
    return createSiteMetadata();
}

export default function Page({ params: { address, tokenId, ...params } }: Props) {
    const chainId = parseChainId(params.chainId);
    if (!chainId) return notFound();
    return <NFTDetailPage chainId={chainId} tokenId={tokenId} address={address} />;
}
