import { type ChainId, useRedPacketConstants } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { readContract } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { useChainContext } from '@/hooks/useChainContext.js';
import { HappyRedPacketV4ABI } from '@/mask/bindings/constants.js';

export function useAvailability(
    id: string,
    version: number,
    options?: {
        account?: string;
        chainId?: ChainId;
    },
) {
    const { account, chainId } = useChainContext({
        account: options?.account,
        chainId: options?.chainId,
    });
    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(chainId);

    return useQuery({
        queryKey: ['red-packet', 'check-availability', chainId, version, id, account, redpacketContractAddress],
        queryFn: async () => {
            if (!id || !redpacketContractAddress) return null;
            const data = (await readContract(config, {
                abi: HappyRedPacketV4ABI,
                functionName: 'check_availability',
                address: redpacketContractAddress as Address,
                args: [id],
                account: account as Address,
                chainId,
            })) as [string, bigint, bigint, bigint, boolean, bigint];

            const [token_address, balance, total, claimed, expired, claimed_amount] = data;
            return {
                token_address,
                balance: balance.toString(),
                total: total.toString(),
                claimed: claimed.toString(),
                expired,
                claimed_amount: claimed_amount.toString(),
            };
        },
        refetchInterval(query) {
            const { data } = query.state;
            if (!data) return 30_000;
            if (data.expired || !data.balance) return false;
            return 30_000;
        },
    });
}
