'use client';

import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import { ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { GridListInPage, type GridListInPageProps } from '@/components/GridListInPage.js';
import { getNFTItemContent, POAPGridListComponent } from '@/components/Profile/POAPList.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveWalletProfileProvider } from '@/helpers/resolveWalletProfileProvider.js';

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
            const provider = resolveWalletProfileProvider(chainId);
            return collectionId
                ? provider.getNFTsByCollectionId(collectionId, { indicator, chainId }, true)
                : provider.getNFTs(address, { indicator, chainId }, true);
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
                    return getNFTItemContent(index, item as NonFungibleAsset<ChainId.Mainnet, SchemaType.ERC721>, {
                        ownerCount: item.schema === SchemaType.ERC1155 ? item.tokenCount : undefined,
                    });
                },
            }}
        />
    );
}
