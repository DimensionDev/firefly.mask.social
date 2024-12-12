import { NetworkPluginID } from '@/constants/enum.js';
import { useQuery } from '@tanstack/react-query';

import type { Web3Helper } from '@/maskbook/packages/web3-helpers/src/index.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';

export function useCheckSponsorableGasFee<T extends NetworkPluginID>(
    chainId: Web3Helper.Definition[T]['ChainId'],
    walletAddress?: string,
) {
    return useQuery({
        queryKey: ['firefly-red-packet-sponsorable-gas-fee', walletAddress, chainId],
        queryFn() {
            if (!walletAddress || !chainId) return false;
            return FireflyRedPacket.checkGasFreeStatus(walletAddress, chainId);
        },
    });
}
