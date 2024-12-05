import { ChainId } from '@masknet/web3-shared-evm';
import { useAccount, useChainId } from 'wagmi';

interface Context {
    chainId?: number;
    account?: string;
}

export function useChainContext(overrides?: Context) {
    const account = useAccount();
    const chainId = useChainId();

    return {
        account: overrides?.account ?? account.address ?? '',
        chainId: overrides?.chainId ?? chainId ?? ChainId.Mainnet,
    };
}
