import type { ChainId } from '@masknet/web3-shared-evm';
import { type Address } from 'viem';
import { estimateFeesPerGas, estimateGas } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { multipliedBy, ZERO } from '@/helpers/number.js';
import { EVMChainResolver } from '@/mask/bindings/index.js';
import { isNativeToken } from '@/providers/ethereum/isNativeToken.js';
import { EthereumNetwork } from '@/providers/ethereum/Network.js';
import type { TransactionOptions } from '@/providers/types/Transfer.js';

export async function getDefaultGas({ token, to }: TransactionOptions<ChainId, Address>) {
    const account = await EthereumNetwork.getAccount();
    const isEIP1559 = EVMChainResolver.isFeatureSupported(token.chainId, 'EIP1559');
    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await estimateFeesPerGas(config, {
        chainId: token.chainId,
        type: isEIP1559 ? 'eip1559' : 'legacy',
    });
    const parameters = { chainId: token.chainId, account, to };
    let gasLimit: bigint;
    try {
        if (isEIP1559) {
            gasLimit = await estimateGas(config, {
                ...parameters,
                type: 'eip1559',
                maxFeePerGas,
                maxPriorityFeePerGas,
            });
        } else {
            gasLimit = await estimateGas(config, {
                ...parameters,
                type: 'legacy',
                gasPrice,
            });
        }
    } catch {
        // Fallback to default gas limit
        gasLimit = isNativeToken(token) ? 21000n : 50000n;
    }

    const gasFee = isEIP1559
        ? !maxFeePerGas
            ? ZERO
            : multipliedBy(maxFeePerGas.toString(), gasLimit.toString())
        : !gasPrice
          ? ZERO
          : multipliedBy(gasPrice.toString(), gasLimit.toString());

    return {
        gas: multipliedBy(gasFee, '1.3'),
        maxFeePerGas,
        maxPriorityFeePerGas,
        gasPrice,
        gasLimit,
        isEIP1559,
    };
}
