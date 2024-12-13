import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { SimpleHashProvider } from '@/providers/simplehash/index.js';
import { useInvalidNFTStore } from '@/store/useInvalidNFTStore.js';

export function useNFTDetail(address?: string, tokenId?: string, chainId: ChainId = ChainId.Mainnet) {
    const enabled = !!address && !!tokenId;
    return useQuery({
        queryKey: ['nft-detail', address, tokenId, chainId],
        enabled,
        async queryFn() {
            if (!enabled) return;
            const result = await SimpleHashProvider.getNFT(
                address,
                tokenId,
                {
                    chainId,
                },
                true,
            );
            if (!result) {
                useInvalidNFTStore.getState().add(chainId, address, tokenId);
            }
            return result;
        },
    });
}
