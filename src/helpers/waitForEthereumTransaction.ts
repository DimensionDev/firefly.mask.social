import type { ChainId } from '@masknet/web3-shared-evm';
import { getTransactionConfirmations, waitForTransactionReceipt } from '@wagmi/core';
import { type Hash } from 'viem';

import { config } from '@/configs/wagmiClient.js';

export async function waitForEthereumTransaction(chainId: ChainId, hash: Hash): Promise<void> {
    try {
        await waitForTransactionReceipt(config, {
            hash,
            chainId,
            retryCount: 15,
            timeout: 1000 * 60 * 2,
        });
    } catch (error) {
        const blocks = await getTransactionConfirmations(config, {
            hash,
            chainId,
        });
        if (blocks < 1) {
            throw error;
        }
    }
}
