import { skipToken, useQuery } from '@tanstack/react-query';

import { Coingecko } from '@/providers/coingecko/index.js';

export function useCoinPriceStats(coinId: string | undefined, days = 1) {
    return useQuery({
        queryKey: ['coingecko', 'token-price-stats', coinId, days],
        queryFn: coinId ? () => Coingecko.getPriceStats(coinId, days) : skipToken,
        select(data) {
            return data.prices.map(([date, price]) => ({ date: new Date(date), value: price }));
        },
    });
}
