import { safeUnreachable } from '@masknet/kit';
import { memo } from 'react';

import { FollowingNFTList } from '@/components/NFTs/FollowingNFTList.js';
import { ArticleList } from '@/components/Profile/ArticleList.js';
import { NFTs } from '@/components/Profile/NFTs.js';
import { POAPList } from '@/components/Profile/POAPList.js';
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
        case WalletProfileCategory.OnChainActivities:
            return <FollowingNFTList walletAddress={address} />;
        default:
            safeUnreachable(type);
            return null;
    }
});