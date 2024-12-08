import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { chains } from '@/configs/wagmiClient.js';
import { formatBalance } from '@/helpers/formatBalance.js';
import { isGreaterThan, multipliedBy } from '@/helpers/number.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { Token } from '@/providers/types/Transfer.js';

function sortTokensByUsdValue(tokens: Token[]) {
    return tokens.sort((a, b) => b.usdValue - a.usdValue);
}

export const useTipsTokens = (address?: string) => {
    const { data, isLoading } = useQuery({
        queryKey: ['tokens', address],
        enabled: !!address,
        queryFn: async () => {
            if (!address) return [];
            return await FireflyEndpointProvider.getTokensByAddress(address);
        },
    });

    const tokens = useMemo(() => {
        return sortTokensByUsdValue(
            (data || [])
                .reduce<Token[]>((acc, token) => {
                    if (!token.chainId || !chains.some((chain) => chain.id === token.chainId)) return acc;
                    return [
                        ...acc,
                        {
                            ...token,
                            chainId: token.chainId,
                            balance: formatBalance(token.raw_amount, token.decimals, { isFixed: true }),
                            usdValue: +multipliedBy(token.price, token.amount).toFixed(2),
                        },
                    ];
                }, [])
                .filter((token) => isGreaterThan(token.usdValue, 0)),
        );
    }, [data]);

    return { tokens, isLoading };
};
