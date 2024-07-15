import { EVMWeb3 } from '@masknet/web3-providers';
import { getAccount } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { ChainId, ProviderType } from '@/constants/ethereum.js';
import { isValidChainId } from '@/helpers/isValidChainId.js';

export async function connectMaskWithWagmi() {
    const account = getAccount(config);
    if (!account.isConnected) return;

    const chainId = account.chain?.id ?? ChainId.Mainnet;
    if (isValidChainId(chainId)) return;

    await EVMWeb3.connect({
        chainId,
        providerType: ProviderType.CustomEvent,
    });
}
