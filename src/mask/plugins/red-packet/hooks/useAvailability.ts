import type { NetworkPluginID } from '@masknet/shared-base';
import type { HappyRedPacketV4 } from '@/mask/bindings/constants.js';
import { useChainContext } from '@masknet/web3-hooks-base';
import type { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { useRedPacketContract } from '@/mask/plugins/red-packet/hooks/useRedPacketContract.js';

export function useAvailability(
    id: string,
    version: number,
    options?: {
        account?: string;
        chainId?: ChainId;
    },
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>({
        account: options?.account,
        chainId: options?.chainId,
    });
    const redPacketContract = useRedPacketContract(chainId, version) as HappyRedPacketV4;
    return useQuery({
        queryKey: ['red-packet', 'check-availability', chainId, version, id, account],
        queryFn: async () => {
            if (!id || !redPacketContract) return null;
            return redPacketContract.methods.check_availability(id).call({
                // check availability is ok w/o account
                from: account,
            });
        },
        refetchInterval(query) {
            const { data } = query.state;
            if (!data) return 30_000;
            if (data.expired || !data.balance) return false;
            return 30_000;
        },
    });
}
