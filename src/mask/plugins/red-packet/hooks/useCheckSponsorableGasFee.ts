import type { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { FireflyRedPacket } from '@/providers/red-packet/index.js';

export function useCheckSponsorableGasFee(chainId: ChainId, walletAddress?: string) {
    return useQuery({
        queryKey: ['firefly-red-packet-sponsorable-gas-fee', walletAddress, chainId],
        queryFn() {
            if (!walletAddress || !chainId) return false;
            return FireflyRedPacket.checkGasFreeStatus(chainId, walletAddress);
        },
    });
}
