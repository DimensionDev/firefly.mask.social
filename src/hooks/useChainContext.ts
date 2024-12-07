import { ChainId } from '@masknet/web3-shared-evm';
import { useAccount, useChainId } from 'wagmi';

import { EVMChainResolver } from '@/mask/bindings/index.js';

export interface ChainContextOverride {
    chainId?: number;
    account?: string;
}

export function useChainContext(overrides?: ChainContextOverride) {
    const account = useAccount();
    const chainId = useChainId();
    const isEIP1559 = EVMChainResolver.isFeatureSupported(chainId, 'EIP1559') ? 'eip1559' : 'legacy';

    return {
        account: overrides?.account ?? account.address ?? '',
        chainId: overrides?.chainId ?? chainId ?? ChainId.Mainnet,
        isEIP1559,
    };
}
