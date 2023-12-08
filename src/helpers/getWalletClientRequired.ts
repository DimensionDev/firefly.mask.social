import { t } from '@lingui/macro';
import { getWalletClient, type GetWalletClientArgs, type GetWalletClientResult } from 'wagmi/actions';

import { ConnectWalletModalRef } from '@/modals/controls.js';

export async function getWalletClientRequired(
    args?: GetWalletClientArgs,
): Promise<Exclude<GetWalletClientResult, null>> {
    const firstTryResult = await getWalletClient(args);
    if (!firstTryResult) await ConnectWalletModalRef.openAndWaitForClose();

    const secondTryResult = firstTryResult ?? (await getWalletClient(args));
    if (!secondTryResult) throw new Error(t`No wallet client found`);

    return secondTryResult;
}
