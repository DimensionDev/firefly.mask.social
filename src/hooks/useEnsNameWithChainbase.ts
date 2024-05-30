import { ChainbaseDomain } from '@masknet/web3-providers';
import { ChainId } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';

export function useEnsNameWithChainbase(address?: string) {
    return useQuery({
        queryKey: ['ens-name-chainbase', address],
        queryFn: () => ChainbaseDomain.reverse(ChainId.Mainnet, address!),
        enabled: !!address,
    });
}
