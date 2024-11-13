import { skipToken, useQuery } from '@tanstack/react-query';

import { CoinGecko } from '@/providers/coingecko/index.js';

export function useTokenPrice(coinId: string | undefined) {
    return useQuery({
        queryKey: ['coingecko', 'coin-price', coinId],
        queryFn: coinId ? () => CoinGecko.getTokenPrice(coinId) : skipToken,
    });
}
