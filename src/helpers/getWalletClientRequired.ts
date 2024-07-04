import { t } from '@lingui/macro';
import type { Config } from 'wagmi';
import { getWalletClient, type GetWalletClientParameters, type GetWalletClientReturnType } from 'wagmi/actions';

import { chains } from '@/configs/wagmiClient.js';
import { ChainModalRef, RainbowKitModalRef } from '@/modals/controls.js';

async function getWalletClientCatch(...args: Parameters<typeof getWalletClient>) {
    try {
        return await getWalletClient(...args);
    } catch {
        return null;
    }
}

export async function getWalletClientRequired(
    config: Config,
    args?: GetWalletClientParameters,
): Promise<Exclude<GetWalletClientReturnType, null>> {
    const firstTryResult = await getWalletClientCatch(config, args);
    if (!firstTryResult) await RainbowKitModalRef.openAndWaitForClose();

    const secondTryResult = firstTryResult ?? (await getWalletClientCatch(config, args));
    if (!secondTryResult) throw new Error(t`No wallet client found. Please connect your wallet.`);

    if (args?.chainId && args.chainId !== secondTryResult.chain.id) {
        await ChainModalRef.openAndWaitForClose();
        if (args?.chainId !== secondTryResult.chain.id) {
            const chainName = chains.find((x) => x.id === args?.chainId)?.name;

            if (chainName) throw new Error(t`Please switch to the ${chainName} network in your wallet.`);
            else throw new Error(t`Please switch to the correct network in your wallet.`);
        }
    }

    return secondTryResult;
}
