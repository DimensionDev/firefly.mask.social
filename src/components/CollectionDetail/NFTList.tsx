'use client';

import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import type { NonFungibleAsset } from '@masknet/web3-shared-base';
import { ChainId, SchemaType } from '@masknet/web3-shared-evm';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { GridListInPage } from '@/components/GridListInPage.js';
import { getNFTItemContent, POAPGridListComponent } from '@/components/Profile/POAPList.js';
import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export function NFTList(props: { address: string; chainId?: ChainId }) {
    const { address, chainId } = props;
    const queryResult = useSuspenseInfiniteQuery({
        initialPageParam: '',
        queryKey: ['nft-list', address, chainId],
        async queryFn({ pageParam }) {
            const indicator = createIndicator(undefined, pageParam);
            return SimpleHashWalletProfileProvider.getNFTs(address, { indicator, chainId });
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
                    return getNFTItemContent(index, item as NonFungibleAsset<ChainId.Mainnet, SchemaType.ERC721>, {
                        isShowOwner: true,
                    });
                },
            }}
        />
    );
}
