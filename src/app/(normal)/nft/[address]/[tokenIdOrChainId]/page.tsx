import { notFound, redirect } from 'next/navigation.js';

import { CollectionInfo } from '@/components/CollectionDetail/CollectionInfo.js';
import { CollectionTabs } from '@/components/CollectionDetail/CollectionTabs.js';
import { NFTNavbar } from '@/components/NFTs/NFTNavbar.js';
import { createMetadataNFTCollection } from '@/helpers/createMetadataNFT.js';
import { createSiteMetadata } from '@/helpers/createSiteMetadata.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { parseChainId } from '@/helpers/parseChainId.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export const revalidate = 60;

interface Props {
    params: {
        address: string;
        tokenIdOrChainId: string;
    };
    searchParams: {
        chainId?: string;
    };
}

export async function generateMetadata({ params: { address, tokenIdOrChainId }, searchParams }: Props) {
    const chainId = parseChainId(tokenIdOrChainId);
    if (chainId) return createMetadataNFTCollection(address, chainId);
    return createSiteMetadata();
}

export default async function Page({ params: { address, tokenIdOrChainId }, searchParams }: Props) {
    const chainId = parseChainId(searchParams.chainId);
    if (chainId) {
        return redirect(resolveNftUrl(address, { tokenId: tokenIdOrChainId, chainId }));
    }

    const collectionChainId = parseChainId(tokenIdOrChainId);
    if (!collectionChainId) return notFound();
    const data = await SimpleHashWalletProfileProvider.getCollection(address, { chainId: collectionChainId });

    if (!data) {
        return notFound();
    }

    return (
        <div className="min-h-screen">
            <NFTNavbar>{data.name}</NFTNavbar>
            <CollectionInfo
                address={address}
                name={data.name}
                bannerImageUrl={data.banner_image_url}
                imageUrl={data.image_url}
                nftCount={data.distinct_nft_count}
                ownerCount={data.distinct_owner_count}
                floorPrice={getFloorPrice(data?.floor_prices)}
                chainId={collectionChainId}
                collectionId={data.collection_id}
            />
            <CollectionTabs address={address} chainId={collectionChainId} totalQuantity={data.total_quantity} />
        </div>
    );
}
