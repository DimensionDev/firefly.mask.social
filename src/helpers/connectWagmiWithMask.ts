import { EVMWeb3 } from '@masknet/web3-providers';
import { ChainId, isValidChainId,ProviderType } from '@masknet/web3-shared-evm';
import { getAccount, getNetwork } from 'wagmi/actions';

export async function connectMaskWithWagmi() {
    const account = getAccount();
    if (!account.isConnected) return;

    const network = getNetwork();
    const chainId = network.chain?.id ?? ChainId.Mainnet;

    if (!isValidChainId(chainId)) return;
    await EVMWeb3.connect({
        chainId,
        providerType: ProviderType.CustomEvent,
    });
}
