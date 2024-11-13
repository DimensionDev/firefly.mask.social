import { skipToken, useQuery } from '@tanstack/react-query';

import { CoinGecko } from '@/providers/coingecko/index.js';

export function useCoinTrending(coinId: string | undefined) {
    return useQuery({
        queryKey: ['coingecko', 'trending', coinId],
        queryFn: coinId ? () => CoinGecko.getCoinTrending(coinId) : skipToken,
    });
}
