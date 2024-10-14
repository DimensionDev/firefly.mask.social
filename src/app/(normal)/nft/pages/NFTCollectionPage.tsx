'use client'

import { ChainId } from '@masknet/web3-shared-evm';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { CollectionInfo } from '@/components/CollectionDetail/CollectionInfo.js';
import { CollectionTabs } from '@/components/CollectionDetail/CollectionTabs.js';
import { NFTNavbar } from '@/components/NFTs/NFTNavbar.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export function NFTCollectionPage({ chainId, address }: { chainId: ChainId, address: string }) {
    const { data } = useSuspenseQuery({
        queryKey: ['nft-collection', chainId, address],
        async queryFn() {
            return await SimpleHashWalletProfileProvider.getCollection(address, { chainId })
        }
    })

    if (!data) notFound()

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
