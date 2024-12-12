import { useQuery } from '@tanstack/react-query';

import { NetworkPluginID } from '@/constants/enum.js';
import { FireflyRedPacket } from '@/providers/red-packet/index.js';

export function useCheckSponsorableGasFee<T extends NetworkPluginID>(chainId: number, walletAddress?: string) {
    return useQuery({
        queryKey: ['firefly-red-packet-sponsorable-gas-fee', walletAddress, chainId],
        queryFn() {
            if (!walletAddress || !chainId) return false;
            return FireflyRedPacket.checkGasFreeStatus(walletAddress, chainId);
        },
    });
}
