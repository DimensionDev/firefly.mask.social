import { safeUnreachable } from '@masknet/kit';
import { memo } from 'react';

import { FollowingNFTList } from '@/components/NFTs/FollowingNFTList.js';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { PolymarketTimeLine } from '@/components/Polymarket/PolymarketTimeLine.js';
import { ArticleList } from '@/components/Profile/ArticleList.js';
import { NFTs } from '@/components/Profile/NFTs.js';
import { POAPList } from '@/components/Profile/POAPList.js';
import { FollowingSnapshotList } from '@/components/Snapshot/FollowingSnapshotList.js';
import { NetworkType, WalletProfileCategory } from '@/constants/enum.js';
import { getAddressType } from '@/helpers/getAddressType.js';

export const WalletProfileContentList = memo(function WalletProfileContentList({
    type,
    address,
}: {
    type: WalletProfileCategory;
    address: string;
}) {
    if (getAddressType(address) !== NetworkType.Ethereum) {
        return <NoResultsFallback className="max-md:py-20 md:pt-[228px]" />;
    }
    switch (type) {
        case WalletProfileCategory.Articles:
            return <ArticleList address={address} />;
        case WalletProfileCategory.POAPs:
            return <POAPList address={address} />;
        case WalletProfileCategory.NFTs:
            return <NFTs address={address} />;
        case WalletProfileCategory.Activities:
            return <FollowingNFTList walletAddress={address} />;
        case WalletProfileCategory.DAO:
            return <FollowingSnapshotList walletAddress={address} />;
        case WalletProfileCategory.Polymarket:
            return <PolymarketTimeLine address={address} isFollowing={false} />;
        default:
            safeUnreachable(type);
            return null;
    }
});
