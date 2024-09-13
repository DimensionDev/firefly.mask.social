'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getSingleFollowingNFTItemContent } from '@/components/NFTs/VirtualListHelper.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { createIndicator } from '@/helpers/pageable.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function FollowingNFTList({ walletAddress }: { walletAddress?: string }) {
    const currentProfileAll = useCurrentProfileAll();
    const profileKey = SORTED_SOCIAL_SOURCES.map((x) => currentProfileAll[x]?.profileId);

    const queryKey = walletAddress
        ? ['nfts-of', walletAddress, profileKey]
        : ['nfts', 'following', Source.NFTs, profileKey];
    const nftQueryResult = useSuspenseInfiniteQuery({
        queryKey,
        networkMode: 'always',
        async queryFn({ pageParam }) {
            return FireflySocialMediaProvider.getFollowingNFTs({
                indicator: createIndicator(undefined, pageParam),
                walletAddresses: walletAddress ? [walletAddress] : undefined,
            });
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((p) => p.data),
    });

    return (
        <ListInPage
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
                className: 'pt-[228px]',
            }}
        />
    );
}
