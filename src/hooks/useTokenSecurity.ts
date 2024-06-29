import { skipToken, useQuery } from '@tanstack/react-query';

import { GoPlus } from '@/providers/goplus/index.js';

export function useTokenSecurity(chainId: number | undefined, address: string | undefined) {
    return useQuery({
        queryKey: ['token-security', chainId, address],
        queryFn: chainId && address ? () => GoPlus.getTokenSecurity(chainId, address) : skipToken,
    });
}
