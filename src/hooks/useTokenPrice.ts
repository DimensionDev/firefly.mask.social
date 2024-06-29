import { skipToken, useQuery } from '@tanstack/react-query';

import { Coingecko } from '@/providers/coingecko/index.js';

export function useTokenPrice(coinId: string | undefined) {
    return useQuery({
        queryKey: ['coingecko', 'coin-price', coinId],
        queryFn: coinId ? () => Coingecko.getTokenPrice(coinId) : skipToken,
    });
}
