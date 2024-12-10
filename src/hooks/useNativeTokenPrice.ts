import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { type ChainContextOverride, useChainContext } from '@/hooks/useChainContext.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import { CoinGecko } from '@/providers/coingecko/index.js';

export function useNativeTokenPrice(override?: ChainContextOverride) {
    const { chainId: chainId } = useChainContext(override);
    const nativeToken = useMemo(() => EVMChainResolver.nativeCurrency(chainId), [chainId]);

    return useQuery({
        queryKey: ['native-token', 'price', chainId, nativeToken.address],
        queryFn: async () => CoinGecko.getFungibleTokenPrice(chainId, nativeToken.address),
    });
}
