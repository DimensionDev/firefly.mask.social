import { isNativeTokenAddress } from '@masknet/web3-shared-evm';
import { useQuery } from '@tanstack/react-query';
import { readContract } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { getTokenAbiForWagmi } from '@/helpers/getTokenAbiForWagmi.js';
import { type ChainContextOverride, useChainContext } from '@/hooks/useChainContext.js';

export function useERC20TokenAllowance(address?: `0x${string}`, spender?: string, override?: ChainContextOverride) {
    const { account, chainId } = useChainContext(override);
    const isNativeToken = isNativeTokenAddress(address);
    return useQuery({
        enabled: isNativeToken,
        queryKey: ['erc20-allowance', address, account, spender],
        queryFn: async () => {
            if (!account || !address || !spender || isNativeToken) return undefined;

            return readContract(config, {
                chainId,
                abi: getTokenAbiForWagmi(chainId, address),
                functionName: 'allowance',
                args: [account as `0x${string}`, spender as `0x${string}`],
                address,
            });
        },
    });
}
