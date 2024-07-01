import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/configs/queryClient.js';
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

export async function getTokenInfo(symbol: string) {
    const tokens = await queryClient.fetchQuery({
        queryKey: ['coingecko', 'tokens'],
        queryFn: () => Coingecko.getTokens(),
    });
    const sym = symbol.toLowerCase();
    return tokens.find((x) => x.symbol === sym) || null;
}
