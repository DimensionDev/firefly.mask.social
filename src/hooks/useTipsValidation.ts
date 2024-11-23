import { t } from '@lingui/macro';
import { useAsync } from 'react-use';

import { isSameEthereumAddress } from '@/helpers/isSameAddress.js';
import { isZero } from '@/helpers/number.js';
import { resolveNetworkProvider, resolveTransferProvider } from '@/helpers/resolveTokenTransfer.js';
import { trimify } from '@/helpers/trimify.js';
import { TipsContext } from '@/hooks/useTipsContext.js';

export function useTipsValidation() {
    const { recipient, token, amount } = TipsContext.useContainer();

    return useAsync(async () => {
        if (!recipient || !token || !trimify(amount) || isZero(trimify(amount))) {
            return { label: t`Send`, disabled: true };
        }

        const transfer = resolveTransferProvider(recipient.networkType);
        const network = resolveNetworkProvider(recipient.networkType);

        if (isSameEthereumAddress(recipient.address, await network.getAccount())) {
            return { label: t`Cannot send tip to yourself`, disabled: true };
        }

        const isBalanceValid = await transfer.validateBalance({
            to: recipient.address,
            token,
            amount,
        });
        if (!isBalanceValid) {
            return { label: t`Insufficient Balance`, disabled: true };
        }

        const isGasValid = await transfer.validateGas({
            to: recipient.address,
            token,
            amount,
        });
        if (!isGasValid) {
            return { label: t`Insufficient Gas`, disabled: true };
        }
        return { label: t`Send`, disabled: false };
    }, [recipient, token, amount]);
}
