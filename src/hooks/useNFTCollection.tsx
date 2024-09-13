import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export function useNFTCollection(address: string, chainId: ChainId = ChainId.Mainnet) {
    return useQuery({
        queryKey: ['nft-collection', address, chainId],
        async queryFn() {
            return SimpleHashWalletProfileProvider.getCollection(address, {
                chainId,
            });
        },
    });
}
