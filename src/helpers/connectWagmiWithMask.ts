import { EVMWeb3 } from '@masknet/web3-providers';
import { ChainId, isValidChainId, ProviderType } from '@masknet/web3-shared-evm';
import { getAccount } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';

export async function connectMaskWithWagmi() {
    const account = getAccount(config);
    if (!account.isConnected) return;

    const chainId = account.chain?.id ?? ChainId.Mainnet;
    if (!isValidChainId(chainId)) return;

    await EVMWeb3.connect({
        chainId,
        providerType: ProviderType.CustomEvent,
    });
}
