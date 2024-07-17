import type { ChainId } from '@masknet/web3-shared-evm';
import { estimateGas, getGasPrice } from '@wagmi/core';
import { type Address } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { multipliedBy } from '@/helpers/number.js';
import { EthereumNetwork } from '@/providers/ethereum/Network.js';
import type { TransactionOptions } from '@/providers/types/Transfer.js';

export async function getDefaultGas({ token, to }: TransactionOptions<ChainId, Address>) {
    const account = await EthereumNetwork.getAccount();
    const gasPrice = await getGasPrice(config, { chainId: token.chainId });
    const gasLimit = await estimateGas(config, {
        chainId: token.chainId,
        account,
        to,
    });

    return multipliedBy(gasPrice.toString(), gasLimit.toString());
}
