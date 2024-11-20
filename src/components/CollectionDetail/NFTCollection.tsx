import { CollectionInfo } from '@/components/CollectionDetail/CollectionInfo.js';
import { CollectionTabs } from '@/components/CollectionDetail/CollectionTabs.js';
import { NFTNavbar } from '@/components/NFTs/NFTNavbar.js';
import { getFloorPrice } from '@/helpers/getFloorPrice.js';
import { resolveCollectionChain } from '@/helpers/resolveCollectionChain.js';
import type { SimpleHashCollection } from '@/providers/types/WalletProfile.js';

interface NFTCollectionProps {
    collection: SimpleHashCollection;
    address?: string;
    chainId?: number;
}

export function NFTCollection({ collection, ...rest }: NFTCollectionProps) {
    const resolved = resolveCollectionChain(collection);
    const address = rest.address ?? resolved.address;
    const chainId = rest.chainId ?? resolved.chainId;

    return (
        <div className="min-h-screen">
            <NFTNavbar>{collection.name}</NFTNavbar>
            <CollectionInfo
                address={address}
                name={collection.name}
                bannerImageUrl={collection.banner_image_url}
                imageUrl={collection.image_url}
                nftCount={collection.distinct_nft_count}
                ownerCount={collection.distinct_owner_count}
                floorPrice={getFloorPrice(collection?.floor_prices)}
                chainId={chainId}
                collectionId={collection.collection_id}
            />
            <CollectionTabs
                collectionId={collection.collection_id}
                address={address}
                chainId={chainId}
                totalQuantity={collection.total_quantity}
            />
        </div>
    );
}
