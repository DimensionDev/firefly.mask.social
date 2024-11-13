'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ListInPage } from '@/components/ListInPage.js';
import { Empty } from '@/components/Search/Empty.js';
import { SearchableTokenItem } from '@/components/Search/SearchableTokenItem.js';
import { TokenMarketData } from '@/components/TokenProfile/TokenMarketData.js';
import { ScrollListKey } from '@/constants/enum.js';
import type { CoinGeckoToken } from '@/providers/types/CoinGecko.js';
import type { SearchableToken } from '@/providers/types/Firefly.js';
import { searchTokens, type TokenWithMarket } from '@/services/searchTokens.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

function formatMarketToken(token: SearchableToken) {
    return {
        pluginID: 'string',
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        source: '',
        type: 'FungibleToken',
        logoURL: token.thumb,
        rank: token.market_cap_rank,
        socialLinks: {
            website: '',
            twitter: '',
            telegram: '',
        },
    } as CoinGeckoToken;
}

const getSearchItemContent = (token: TokenWithMarket) => {
    return token.hit ? (
        <div className="p-3">
            <TokenMarketData linkable token={formatMarketToken(token)} />
        </div>
    ) : (
        <SearchableTokenItem key={token.id} token={token} />
    );
};

export function SearchTokenContent() {
    const { searchKeyword, searchType, source } = useSearchStateStore();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['search', searchType, searchKeyword, source],
        queryFn: async () => {
            if (!searchKeyword) return;

            return searchTokens(searchKeyword);
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
                computeItemKey: (index, token) => `${token.id}_${index}`,
                itemContent: (_, token) => getSearchItemContent(token),
            }}
            NoResultsFallbackProps={{
                message: <Empty keyword={searchKeyword} />,
            }}
        />
    );
}
