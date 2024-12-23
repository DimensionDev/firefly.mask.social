import { useRedPacketConstants } from '@masknet/web3-shared-evm';
import { produce } from 'immer';
import { useAsyncFn } from 'react-use';
import type { Address } from 'viem';
import { writeContract } from 'wagmi/actions';

import { queryClient } from '@/configs/queryClient.js';
import { config } from '@/configs/wagmiClient.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { type ChainContextOverride, useChainContext } from '@/hooks/useChainContext.js';
import { HappyRedPacketV4ABI } from '@/mask/bindings/constants.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

export function useRefundCallback(id?: string, overrideChainContext?: ChainContextOverride) {
    const { chainId, account } = useChainContext(overrideChainContext);
    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(chainId);

    return useAsyncFn(async () => {
        if (!redpacketContractAddress || !id) return;

        const hash = await writeContract(config, {
            abi: HappyRedPacketV4ABI,
            functionName: 'refund',
            address: redpacketContractAddress as Address,
            args: [id],
            chainId,
        });

        await waitForEthereumTransaction(chainId, hash);

        queryClient.setQueriesData(
            { queryKey: ['redpacket-history', account, FireflyRedPacketAPI.ActionType.Send] },
            (
                old:
                    | {
                          pages: Array<{
                              data: Array<
                                  FireflyRedPacketAPI.RedPacketClaimedInfo | FireflyRedPacketAPI.RedPacketSentInfo
                              >;
                          }>;
                      }
                    | undefined,
            ) => {
                if (!old?.pages) return old;

                return produce(old, (draft) => {
                    for (const page of draft.pages) {
                        if (!page) continue;
                        for (const item of page.data) {
                            if (item.redpacket_id === id)
                                item.redpacket_status = FireflyRedPacketAPI.RedPacketStatus.Refund;
                        }
                    }
                });
            },
        );

        queryClient.refetchQueries({
            queryKey: ['red-packet', 'claim', id],
        });

        queryClient.refetchQueries({
            queryKey: ['red-packet', 'check-availability', chainId, 4, id, account],
        });
    }, [chainId, redpacketContractAddress, id]);
}
