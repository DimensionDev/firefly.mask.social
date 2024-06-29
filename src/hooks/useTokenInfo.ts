import { useQuery } from '@tanstack/react-query';

import { Coingecko } from '@/providers/coingecko/index.js';

export function useTokenInfo(symbol: string) {
    return useQuery({
        queryKey: ['coingecko', 'tokens'],
        queryFn: () => Coingecko.getTokens(),
        select: (tokens) => {
            const sym = symbol.toLowerCase();
            const token = tokens.find((x) => x.symbol === sym) || null;
            return token;
        },
    });
}
