'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { GridListInPage } from '@/components/GridListInPage.js';
import { getNFTItemContent, POAPGridListComponent } from '@/components/Profile/POAPList.js';
import { ChainId } from '@/constants/ethereum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator } from '@/helpers/pageable.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';
import type { NonFungibleAsset } from '@/types/ethereum.js';

export function NFTListByCollectionId(props: { collectionId: string; owner: string; chainId?: ChainId }) {
    const { collectionId, owner, chainId } = props;
    const queryResult = useSuspenseInfiniteQuery({
        initialPageParam: '',
        queryKey: ['nft-list-by-collection-id', collectionId, owner, chainId],
        async queryFn({ pageParam }) {
            const indicator = createIndicator(
                pageParam ? { index: 1, id: pageParam, __type__: 'PageIndicator' } : undefined,
                pageParam,
            );
            return SimpleHashWalletProfileProvider.getNFTsByCollectionIdAndOwner(collectionId, owner, {
                indicator,
                chainId,
            });
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page.data ?? EMPTY_LIST),
    });

    return (
        <GridListInPage
            queryResult={queryResult}
            className="mt-2"
            VirtualGridListProps={{
                components: POAPGridListComponent,
                itemContent: (index, item) => {
                    return getNFTItemContent(index, item as unknown as NonFungibleAsset, {
                        isShowChainIcon: true,
                    });
                },
            }}
        />
    );
}
