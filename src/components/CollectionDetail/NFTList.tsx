'use client';

import { SchemaType } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { GridListInPage, type GridListInPageProps } from '@/components/GridListInPage.js';
import { getNFTItemContent, POAPGridListComponent } from '@/components/Profile/POAPList.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator } from '@/helpers/pageable.js';
import { SimpleHashProvider } from '@/providers/simplehash/index.js';
import { fillBookmarkStatusForNonFungibleAssets } from '@/services/fillBookmarkStatusForNFT.js';

interface NFTListProps extends Partial<GridListInPageProps> {
    address: string;
    chainId?: number;
    collectionId?: string;
}

export function NFTList(props: NFTListProps) {
    const { address, chainId, collectionId, ...rest } = props;
    const queryResult = useSuspenseInfiniteQuery({
        initialPageParam: '',
        queryKey: ['nft-list', address, chainId, collectionId],
        async queryFn({ pageParam }) {
            const indicator = createIndicator(
                pageParam ? { index: 1, id: pageParam, __type__: 'PageIndicator' } : undefined,
                pageParam,
            );
            const response = collectionId
                ? await SimpleHashProvider.getNFTsByCollectionId(collectionId, { indicator, chainId }, true)
                : await SimpleHashProvider.getNFTs(address, { indicator, chainId }, true);

            return {
                ...response,
                data: await fillBookmarkStatusForNonFungibleAssets(response.data),
            };
        },
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page.data ?? EMPTY_LIST),
    });

    return (
        <GridListInPage
            {...rest}
            queryResult={queryResult}
            className="mt-2"
            VirtualGridListProps={{
                components: POAPGridListComponent,
                itemContent: (index, item) => {
                    return getNFTItemContent(index, item, {
                        ownerCount: item.schema === SchemaType.ERC1155 ? item.tokenCount : undefined,
                    });
                },
            }}
        />
    );
}
