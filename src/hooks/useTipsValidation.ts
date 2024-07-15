import { t } from '@lingui/macro';
import { isZero } from '@masknet/web3-shared-base';
import { useAsync } from 'react-use';

import { isSameAddress } from '@/helpers/isSameAddress.js';
import { resolveNetworkProvider, resolveTransferProvider } from '@/helpers/resolveTokenTransfer.js';
import { trimify } from '@/helpers/trimify.js';
import { TipsContext } from '@/hooks/useTipsContext.js';

export function useTipsValidation() {
    const { receiver, token, amount } = TipsContext.useContainer();

    const { value, loading, error } = useAsync(async () => {
        if (!receiver || !token || !trimify(amount) || isZero(trimify(amount))) {
            return { label: t`Send Tips`, disabled: true };
        }

        const transfer = resolveTransferProvider(receiver.networkType);
        const network = resolveNetworkProvider(receiver.networkType);

        if (isSameAddress(receiver.address, await network.getAccount())) {
            return { label: t`Cannot send tips to yourself`, disabled: true };
        }

        const isBalanceValid = await transfer.validateBalance({
            to: receiver.address,
            token,
            amount,
        });
        if (!isBalanceValid) {
            return { label: t`Insufficient Balance`, disabled: true };
        }

        const isGasValid = await transfer.validateGas({
            to: receiver.address,
            token,
            amount,
        });
        if (!isGasValid) {
            return { label: t`Insufficient Gas`, disabled: true };
        }
        return { label: t`Send Tips`, disabled: false };
    }, [receiver, token, amount]);

    return { value, loading, error };
}
