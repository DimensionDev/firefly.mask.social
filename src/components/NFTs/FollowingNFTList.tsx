'use client';

import { createIndicator, createPageable, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { getSingleFollowingNFTItemContent } from '@/components/NFTs/VirtualListHelper.js';
import { ScrollListKey, Source } from '@/constants/enum.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FollowingNFT } from '@/providers/types/NFTs.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export function FollowingNFTList({ walletAddresses }: { walletAddresses?: string[] }) {
    const currentSource =
        walletAddresses && walletAddresses.length > 0 ? Source.NFTs : useGlobalState.use.currentSource();

    const nftQueryResult = useSuspenseInfiniteQuery({
        queryKey: ['nft', 'following', currentSource, walletAddresses],
        networkMode: 'always',
        async queryFn({ pageParam }) {
            if (currentSource !== Source.NFTs) return createPageable<FollowingNFT>(EMPTY_LIST, createIndicator());
            return FireflySocialMediaProvider.getFollowingNFTs({
                indicator: createIndicator(undefined, pageParam),
                walletAddresses,
            });
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage.nextIndicator?.id,
        select: (data) => data.pages.flatMap((p) => p.data),
    });

    return (
        <ListInPage
            key={currentSource}
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
