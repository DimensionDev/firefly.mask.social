import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export function useNFTDetail(address: string, tokenId: string, chainId?: ChainId) {
    return useQuery({
        queryKey: ['nft', address, tokenId, chainId],
        queryFn() {
            return SimpleHashWalletProfileProvider.getNFT(address, tokenId, {
                chainId,
            });
        },
    });
}
