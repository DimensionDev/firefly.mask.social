import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

import { resolveNFTIdFromAsset } from '@/helpers/resolveNFTIdFromAsset.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { NFTAsset } from '@/providers/types/Firefly.js';

export function useSponsorMintStatus(nft: NFTAsset) {
    const account = useAccount();

    return useQuery({
        queryKey: ['sponsor-mint-status', account.address, resolveNFTIdFromAsset(nft)],
        enabled: !!account.address,
        queryFn: async () => {
            return FireflyEndpointProvider.getSponsorMintStatus({
                // platformType: '',
                walletAddress: account.address || '',
                contractAddress: nft.contract?.address || '',
                tokenId: +nft.tokenId,
                chainId: nft.chainId,
                buyCount: 1,
            });
        },
    });
}
