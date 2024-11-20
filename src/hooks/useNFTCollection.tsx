import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

import { resolveWalletProfileProvider } from '@/helpers/resolveWalletProfileProvider.js';

export function useNFTCollection(address: string, chainId: ChainId = ChainId.Mainnet) {
    return useQuery({
        queryKey: ['nft-collection', address, chainId],
        async queryFn() {
            const provider = resolveWalletProfileProvider(chainId);
            return provider.getCollection(address, {
                chainId,
            });
        },
    });
}
