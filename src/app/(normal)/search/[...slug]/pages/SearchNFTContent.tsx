'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ListInPage } from '@/components/ListInPage.js';
import { Empty } from '@/components/Search/Empty.js';
import { SearchableNFTItem } from '@/components/Search/SearchableNFTItem.js';
import { ScrollListKey } from '@/constants/enum.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { SearchableNFT } from '@/providers/types/Firefly.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

const getSearchItemContent = (nft: SearchableNFT) => {
    return <SearchableNFTItem key={nft.contract_address} nft={nft} />;
};

function filterAndSortNFTs(nfts: SearchableNFT[], keyword: string) {
    return nfts
        .filter((nft) => nft.owners_total >= 100)
        .sort((a, b) => {
            if (a.name.toLowerCase() === keyword.toLowerCase()) return -1;
            return b.items_total - a.items_total;
        });
}

export function SearchNFTContent() {
    const { searchKeyword, searchType, source } = useSearchStateStore();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['search', searchType, searchKeyword, source],
        queryFn: async () => {
            if (!searchKeyword) return;

            return FireflyEndpointProvider.searchNFTs(searchKeyword);
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select(data) {
            return filterAndSortNFTs(compact(data.pages.flatMap((x) => x?.data ?? [])), searchKeyword);
        },
    });

    const listKey = `${ScrollListKey.Search}:${searchType}:${searchKeyword}:${source}`;

    return (
        <ListInPage
            source={source}
            key={listKey}
            queryResult={queryResult}
            VirtualListProps={{
                listKey,
                computeItemKey: (index, nft) => `${nft.contract_address}_${index}`,
                itemContent: (_, nft) => getSearchItemContent(nft),
            }}
            NoResultsFallbackProps={{
                message: <Empty keyword={searchKeyword} />,
            }}
        />
    );
}
