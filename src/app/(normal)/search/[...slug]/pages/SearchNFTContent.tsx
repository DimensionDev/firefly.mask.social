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
            return compact(data.pages.flatMap((x) => x?.data ?? []));
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
