import { useQuery } from '@tanstack/react-query';

import { getTokenFromCoinGecko } from '@/services/getTokenFromCoinGecko.js';

export function useTokenInfo(symbolOrId: string) {
    return useQuery({
        queryKey: ['coingecko', 'token', symbolOrId],
        queryFn: () => getTokenFromCoinGecko(symbolOrId),
    });
}
