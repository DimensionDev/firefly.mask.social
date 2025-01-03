import { safeUnreachable } from '@masknet/kit';
import { memo } from 'react';

import { FollowingNFTList } from '@/components/NFTs/FollowingNFTList.js';
import { PolymarketTimeLine } from '@/components/Polymarket/PolymarketTimeLine.js';
import { ArticleList } from '@/components/Profile/ArticleList.js';
import { NFTs } from '@/components/Profile/NFTs.js';
import { POAPList } from '@/components/Profile/POAPList.js';
import { FollowingSnapshotList } from '@/components/Snapshot/FollowingSnapshotList.js';
import { WalletProfileCategory } from '@/constants/enum.js';

export const WalletProfileContentList = memo(function WalletProfileContentList({
    type,
    address,
}: {
    type: WalletProfileCategory;
    address: string;
}) {
    switch (type) {
        case WalletProfileCategory.Articles:
            return <ArticleList address={address} />;
        case WalletProfileCategory.POAPs:
            return <POAPList address={address} />;
        case WalletProfileCategory.NFTs:
            return <NFTs address={address} />;
        case WalletProfileCategory.Activities:
            return <FollowingNFTList walletAddress={address} />;
        case WalletProfileCategory.DAOs:
            return <FollowingSnapshotList walletAddress={address} />;
        case WalletProfileCategory.Polymarket:
            return <PolymarketTimeLine address={address} isFollowing={false} />;
        default:
            safeUnreachable(type);
            return null;
    }
});
