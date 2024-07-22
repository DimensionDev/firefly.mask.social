import { getTransactionConfirmations, waitForTransactionReceipt } from '@wagmi/core';
import { type Hash } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { EthereumNetwork } from '@/providers/ethereum/Network.js';

export async function waitForEthereumTransaction(hash: Hash): Promise<void> {
    try {
        await waitForTransactionReceipt(config, {
            hash,
            chainId: EthereumNetwork.getChainId(),
            retryCount: 15,
            timeout: 1000 * 60 * 2,
        });
    } catch (error) {
        const blocks = await getTransactionConfirmations(config, {
            hash,
            chainId: EthereumNetwork.getChainId(),
        });
        if (blocks < 1) {
            throw error;
        }
    }
}
