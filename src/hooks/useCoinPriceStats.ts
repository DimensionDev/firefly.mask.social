import { EMPTY_LIST } from '@masknet/shared-base';
import { skipToken, useQuery } from '@tanstack/react-query';
import { first, last } from 'lodash-es';
import { useMemo } from 'react';

import { Coingecko } from '@/providers/coingecko/index.js';

export function useCoinPriceStats(coinId: string | undefined, days: number | undefined) {
    return useQuery({
        queryKey: ['coingecko', 'token-price-stats', coinId, days],
        queryFn: coinId ? () => Coingecko.getPriceStats(coinId, days) : skipToken,
        select(data) {
            return data.prices.map(([date, price]) => ({ date: new Date(date), value: price }));
        },
    });
}

export function useCoinPrice24hStats(coinId: string | undefined) {
    const { data: priceStats = EMPTY_LIST, isPending } = useCoinPriceStats(coinId, 1);

    const isUp = useMemo(() => {
        const startPrice = first(priceStats)?.value ?? 0;
        const endPrice = last(priceStats)?.value ?? 0;
        return endPrice > startPrice;
    }, [priceStats]);
    return {
        priceStats,
        isPending,
        isUp,
    };
}
