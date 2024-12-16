import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { SimpleHashProvider } from '@/providers/simplehash/index.js';

export function useNFTCollection(address: string, chainId: ChainId = ChainId.Mainnet) {
    return useQuery({
        queryKey: ['nft-collection', address, chainId],
        async queryFn() {
            return SimpleHashProvider.getCollection(address, {
                chainId,
            });
        },
    });
}
