import { formatBalance, multipliedBy } from '@masknet/web3-shared-base';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { chains } from '@/configs/wagmiClient.js';
import { isGreaterThan } from '@/helpers/number.js';
import { resolveNetworkProvider } from '@/helpers/resolveTokenTransfer.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import type { Token } from '@/providers/types/Transfer.js';
import { getTokensByAddress } from '@/services/getTokensByAddress.js';

function sortTokensByUsdValue(tokens: Token[]) {
    return tokens.sort((a, b) => b.usdValue - a.usdValue);
}

export const useTipsTokens = () => {
    const { recipient } = TipsContext.useContainer();
    const { data, isLoading } = useQuery({
        queryKey: ['tokens', recipient?.address],
        enabled: !!recipient,
        queryFn: async () => {
            if (!recipient) return [];
            const network = resolveNetworkProvider(recipient.networkType);
            return await getTokensByAddress(await network.getAccount());
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
