import type { Config } from 'wagmi';
import { getWalletClient, type GetWalletClientParameters, type GetWalletClientReturnType } from 'wagmi/actions';

import { chains } from '@/configs/wagmiClient.js';
import { SwitchChainError } from '@/constants/error.js';
import { ChainModalRef, RainbowKitModalRef } from '@/modals/controls.js';

export async function getWalletClientRequired(
    config: Config,
    args?: GetWalletClientParameters,
): Promise<Exclude<GetWalletClientReturnType, null>> {
    await getWalletClient(config, args);
    await RainbowKitModalRef.openAndWaitForClose();

    const client = await getWalletClient(config, args);

    if (args?.chainId && args.chainId !== client.chain.id) {
        await ChainModalRef.openAndWaitForClose();
        if (args?.chainId !== client.chain.id) {
            const chainName = chains.find((x) => x.id === args?.chainId)?.name;

            if (chainName) throw new SwitchChainError(chainName);
            else throw new SwitchChainError();
        }
    }

    return client;
}
