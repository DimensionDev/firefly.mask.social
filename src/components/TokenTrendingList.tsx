import { safeUnreachable } from '@masknet/kit';
import { useSuspenseQuery } from '@tanstack/react-query';

import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SearchableTokenItem } from '@/components/Search/SearchableTokenItem.js';
import { VirtualListFooterBottomText } from '@/components/VirtualList/VirtualListFooterBottomText.js';
import { TrendingType } from '@/constants/enum.js';
import { Coingecko } from '@/providers/coingecko/index.js';
import type { TokenWithMarket } from '@/services/searchTokens.js';

export function TokenTrendingList({ type }: { type: TrendingType }) {
    const { data, isFetching } = useSuspenseQuery({
        queryKey: ['explore-trending', type],
        queryFn: async () => {
            switch (type) {
                case TrendingType.TopGainers:
                case TrendingType.TopLosers:
                    return Coingecko.getTopGainersOrLosers(type);
                case TrendingType.Trending:
                    return Coingecko.getTopTrendingCoins();
                case TrendingType.Meme:
                    return Coingecko.getTopMemeCoins();
                default:
                    safeUnreachable(type);
                    return [] as TokenWithMarket[];
            }
        },
        networkMode: 'always',
    });

    if (!data.length && !isFetching) {
        return <NoResultsFallback />;
    }

    return (
        <div>
            {data.map((x) => {
                return <SearchableTokenItem key={x.id} token={x} />;
            })}

            <VirtualListFooterBottomText />
        </div>
    );
}
