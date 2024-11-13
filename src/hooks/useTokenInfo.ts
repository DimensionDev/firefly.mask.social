import { useQuery } from '@tanstack/react-query';

import { CoinGecko } from '@/providers/coingecko/index.js';

export function useTokenInfo(symbol: string) {
    return useQuery({
        queryKey: ['coingecko', 'tokens'],
        queryFn: () => CoinGecko.getTokens(),
        select: (tokens) => tokens.find((x) => x.symbol === symbol.toLowerCase()) || null,
    });
}
