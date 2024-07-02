import { NetworkPluginID } from '@masknet/shared-base';
import { useNetworks } from '@masknet/web3-hooks-base';
import { formatBalance } from '@masknet/web3-shared-base';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { getTokensByAddressForTips } from '@/services/getTokensByAddress.js';
import type { TipsToken } from '@/types/token.js';

export const useTipsTokens = () => {
    const account = useAccount();
    const networks = useNetworks(NetworkPluginID.PLUGIN_EVM, true);
    const { data, isLoading } = useQuery({
        queryKey: ['tokens', account.address],
        enabled: account.isConnected && !!account.address,
        queryFn: async () => {
            return await getTokensByAddressForTips(account.address!);
        },
    });

    const tokens = useMemo(() => {
        return (data || [])
            .reduce<TipsToken[]>((acc, token) => {
                const network = networks.find((network) => network.chainId === token.chainId);
                if (!network) return acc;
                return [
                    ...acc,
                    { ...token, network, balance: formatBalance(token.raw_amount, token.decimals, { isFixed: true }) },
                ];
            }, [])
            .filter((token) => !token.balance.includes('<'));
    }, [data, networks]);

    return { tokens, isLoading };
};
