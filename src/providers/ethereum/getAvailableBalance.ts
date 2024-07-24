import type { ChainId } from '@masknet/web3-shared-evm';
import type { Address } from 'viem';

import { isLessThan, minus } from '@/helpers/number.js';
import { getDefaultGas } from '@/providers/ethereum/getDefaultGas.js';
import { getDebankTokenBalance } from '@/providers/ethereum/getTokenBalance.js';
import { EthereumNetwork } from '@/providers/ethereum/Network.js';
import { EthereumTransfer } from '@/providers/ethereum/Transfer.js';
import type { TransactionOptions } from '@/providers/types/Transfer.js';

export async function getAvailableBalance(options: TransactionOptions<ChainId, Address>) {
    const { token } = options;
    const account = await EthereumNetwork.getAccount();
    const balance = await getDebankTokenBalance(token, account);
    if (EthereumTransfer.isNativeToken(token)) {
        const { gas } = await getDefaultGas(options);
        const available = minus(balance.value.toString(), gas);
        return isLessThan(available, 0) ? '0' : available.toString();
    }
    return balance.value.toString();
}
