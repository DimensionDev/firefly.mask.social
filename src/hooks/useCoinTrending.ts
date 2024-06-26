import { skipToken, useQuery } from '@tanstack/react-query';

import { Coingecko } from '@/providers/coingecko/index.js';

export function useCoinTrending(coinId: string | undefined) {
    return useQuery({
        queryKey: ['coingecko', 'trending', coinId],
        queryFn: coinId ? () => Coingecko.getCoinTrending(coinId) : skipToken,
    });
}
