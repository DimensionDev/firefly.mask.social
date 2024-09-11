import { notFound, redirect } from 'next/navigation.js';

import { CollectionInfo } from '@/components/CollectionDetail/CollectionInfo.js';
import { CollectionTabs } from '@/components/CollectionDetail/CollectionTabs.js';
import { NFTNavbar } from '@/components/NFTs/NFTNavbar.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { resolveNftUrl } from '@/helpers/resolveNftUrl.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';
import type { SearchParams } from '@/types/index.js';

export const revalidate = 60;

export default async function Page({
    params: { address, tokenIdOrChainId },
    searchParams,
}: {
    params: {
        address: string;
        tokenIdOrChainId: string;
    };
    searchParams: SearchParams;
}) {
    const chainId = searchParams.chainId ? Number.parseInt(searchParams.chainId as string, 10) : undefined;
    if (chainId) {
        return redirect(resolveNftUrl(address, { tokenId: tokenIdOrChainId, chainId }));
    }

    const collectionChainId = Number.parseInt(tokenIdOrChainId, 10);
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
                chainId={chainId}
                collectionId={data.collection_id}
            />
            <CollectionTabs address={address} chainId={chainId} totalQuantity={data.total_quantity} />
        </div>
    );
}
