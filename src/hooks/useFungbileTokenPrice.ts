import { useQuery } from '@tanstack/react-query';

import { type ChainContextOverride, useChainContext } from '@/hooks/useChainContext.js';
import { CoinGecko } from '@/providers/coingecko/index.js';

export function useFungibleTokenPrice(address?: string, override?: ChainContextOverride) {
    const { chainId } = useChainContext(override);

    return useQuery({
        enabled: !!address,
        queryKey: ['fungbile', 'token-price', chainId, address],
        queryFn: async () => (address ? CoinGecko.getFungibleTokenPrice(chainId, address) : 0),
    });
}
