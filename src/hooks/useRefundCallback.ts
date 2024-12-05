import { useRedPacketConstants } from '@masknet/web3-shared-evm';
import { useAsyncFn } from 'react-use';
import type { Address } from 'viem';
import { writeContract } from 'wagmi/actions';

import { queryClient } from '@/configs/queryClient.js';
import { config } from '@/configs/wagmiClient.js';
import { waitForEthereumTransaction } from '@/helpers/waitForEthereumTransaction.js';
import { type ChainContextOverride, useChainContext } from '@/hooks/useChainContext.js';
import { HappyRedPacketV4ABI } from '@/mask/bindings/constants.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';
import { produce } from 'immer';

export function useRefundCallback(id?: string, overrideChainContext?: ChainContextOverride) {
    const { chainId, account } = useChainContext(overrideChainContext);
    const { HAPPY_RED_PACKET_ADDRESS_V4: redpacketContractAddress } = useRedPacketConstants(chainId);

    return useAsyncFn(
        async (type: FireflyRedPacketAPI.ActionType) => {
            if (!redpacketContractAddress || !id) return;

            const hash = await writeContract(config, {
                abi: HappyRedPacketV4ABI,
                functionName: 'refund',
                address: redpacketContractAddress as Address,
                args: [id],
            });

            await waitForEthereumTransaction(chainId, hash);

            // TODO: update status

            queryClient.setQueriesData(
                { queryKey: ['redpacket-history', account, type] },
                (
                    old:
                        | {
                              pages: Array<{
                                  data: (
                                      | FireflyRedPacketAPI.RedPacketClaimedInfo
                                      | FireflyRedPacketAPI.RedPacketSentInfo
                                  )[];
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
        },
        [chainId, redpacketContractAddress, id],
    );
}
