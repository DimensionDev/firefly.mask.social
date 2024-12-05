import { ConnectorNotConnectedError } from '@wagmi/core';
import type { Config } from 'wagmi';
import { getWalletClient, type GetWalletClientParameters, type GetWalletClientReturnType } from 'wagmi/actions';

import { chains } from '@/configs/wagmiClient.js';
import { SwitchChainError } from '@/constants/error.js';
import { switchEthereumChain } from '@/helpers/switchEthereumChain.js';
import { ConnectModalRef } from '@/modals/controls.js';

export async function getWalletClientRequired(
    config: Config,
    args?: GetWalletClientParameters,
): Promise<Exclude<GetWalletClientReturnType, null>> {
    try {
        await getWalletClient(config, args);
    } catch (error) {
        if (error instanceof ConnectorNotConnectedError) {
            await ConnectModalRef.openAndWaitForClose();
        } else {
            throw error;
        }
    }

    const client = await getWalletClient(config, args);
    if (args?.chainId && args.chainId !== (await client.getChainId())) {
        await switchEthereumChain(args.chainId);
        if (args?.chainId !== (await client.getChainId())) {
            const chainName = chains.find((x) => x.id === args?.chainId)?.name;
            if (chainName) throw new SwitchChainError(chainName);
            else throw new SwitchChainError();
        }
    }

    return client;
}
