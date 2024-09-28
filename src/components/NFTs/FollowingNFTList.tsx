'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ListInPage } from '@/components/ListInPage.js';
import { getSingleFollowingNFTItemContent } from '@/components/NFTs/VirtualListHelper.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createIndicator } from '@/helpers/pageable.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function FollowingNFTList({ walletAddress }: { walletAddress?: string }) {
    const currentProfileAll = useCurrentProfileAll();
    const profileIds = compact(SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId));

    const queryKey = walletAddress
        ? ['nfts-of', walletAddress, profileIds]
        : ['nfts', 'following', Source.NFTs, profileIds];
    const nftQueryResult = useSuspenseInfiniteQuery({
        queryKey,
        networkMode: 'always',
        queryFn: async ({ pageParam }) => {
            if (!profileIds.length) return null;
            return FireflySocialMediaProvider.getFollowingNFTs({
                indicator: createIndicator(undefined, pageParam),
                walletAddresses: walletAddress ? [walletAddress] : undefined,
            });
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => compact(data.pages.flatMap((p) => p?.data)),
    });

    if (!profileIds.length) {
        return <NotLoginFallback source={Source.Farcaster} />;
    }

    return (
        <ListInPage
            source={Source.NFTs}
            queryResult={nftQueryResult}
            VirtualListProps={{
                listKey: `${ScrollListKey.Following}:${Source.NFTs}`,
                computeItemKey: (index, nft) => `${nft.hash}-${index}`,
                itemContent: (index, nft) =>
                    getSingleFollowingNFTItemContent(index, nft, {
                        listKey: `${ScrollListKey.Following}:${Source.NFTs}`,
                    }),
            }}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
        />
    );
}
