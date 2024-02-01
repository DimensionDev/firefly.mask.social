import { t } from '@lingui/macro';
import { getWalletClient, type GetWalletClientArgs, type GetWalletClientResult } from 'wagmi/actions';

import { chains } from '@/configs/wagmiClient.js';
import { ChainModalRef, ConnectWalletModalRef } from '@/modals/controls.js';

export async function getWalletClientRequired(
    args?: GetWalletClientArgs,
): Promise<Exclude<GetWalletClientResult, null>> {
    const firstTryResult = await getWalletClient(args);
    if (!firstTryResult) await ConnectWalletModalRef.openAndWaitForClose();

    const secondTryResult = firstTryResult ?? (await getWalletClient(args));
    if (!secondTryResult) throw new Error(t`No wallet client found`);

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
