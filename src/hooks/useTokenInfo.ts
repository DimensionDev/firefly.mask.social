import { useQuery } from '@tanstack/react-query';

import { Coingecko } from '@/providers/coingecko/index.js';

export function useTokenInfo(symbol: string) {
    return useQuery({
        queryKey: ['coingecko', 'tokens'],
        queryFn: () => Coingecko.getTokens(),
        select: (tokens) => tokens.find((x) => x.symbol === symbol.toLowerCase()) || null,
    });
}
