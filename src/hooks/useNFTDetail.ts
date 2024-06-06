import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';
import { useInvalidNFTStore } from '@/store/useInvalidNFTStore.js';

export function useNFTDetail(address: string, tokenId: string, chainId: ChainId = ChainId.Mainnet) {
    return useQuery({
        queryKey: ['nft', address, tokenId, chainId],
        async queryFn() {
            const result = await SimpleHashWalletProfileProvider.getNFT(address, tokenId, {
                chainId,
            });
            if (!result) {
                useInvalidNFTStore.getState().add(chainId, address, tokenId);
            }
            return result;
        },
    });
}
