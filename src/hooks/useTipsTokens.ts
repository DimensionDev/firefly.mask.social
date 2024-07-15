import { formatBalance, multipliedBy } from '@masknet/web3-shared-base';
import { useQuery } from '@tanstack/react-query';
import { groupBy } from 'lodash-es';
import { useMemo } from 'react';

import { resolveNetwork } from '@/helpers/resolveTokenTransfer.js';
import { TipsContext } from '@/hooks/useTipsContext.js';
import type { Token } from '@/providers/types/Transfer.js';
import { getTokensByAddressForTips } from '@/services/getTokensByAddress.js';

function sortTokensByUsdValue(tokens: Token[]) {
    const groups = groupBy(tokens, (token) => token.chainId);

    return Object.values(groups)
        .map((group) => {
            return group.sort((a, b) => b.usdValue - a.usdValue);
        })
        .sort((a, b) => {
            const maxA = Math.max(...a.map((token) => token.usdValue));
            const maxB = Math.max(...b.map((token) => token.usdValue));
            return maxA > maxB ? -1 : 1;
        })
        .flat();
}

export const useTipsTokens = () => {
    const { receiver } = TipsContext.useContainer();
    const { data, isLoading } = useQuery({
        queryKey: ['tokens', receiver?.address],
        enabled: !!receiver,
        queryFn: async () => {
            if (!receiver) return [];
            const network = resolveNetwork(receiver.networkType);
            return await getTokensByAddressForTips(await network.getAccount());
        },
    });

    const tokens = useMemo(() => {
        return (data || [])
            .reduce<Token[]>((acc, token) => {
                if (!token.chainId) return acc;
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
            .filter((token) => !token.balance.includes('<'));
    }, [data]);

    return { tokens: sortTokensByUsdValue(tokens), isLoading };
};
