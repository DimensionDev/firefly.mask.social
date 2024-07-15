import { EVMExplorerResolver } from '@masknet/web3-providers';
import type { Config } from '@wagmi/core';
import { getAccount, getChainId, switchChain } from '@wagmi/core';
import { type Address, type Hash } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { NotImplementedError } from '@/constants/error.js';
import type { Provider as NetworkProvider } from '@/providers/types/Network.js';

const coreConfig = config as unknown as Config;

export class EVMNetwork implements NetworkProvider<Address, Hash> {
    async connect(): Promise<void> {
        throw new NotImplementedError();
    }

    async getAccount(): Promise<Address> {
        const account = getAccount(coreConfig);
        if (!account.address) {
            throw new Error('Wallet not connected');
        }
        return account.address;
    }

    async switchChain(chainId: number): Promise<void> {
        await switchChain(coreConfig, { chainId });
    }

    getChainId(): number {
        return getChainId(coreConfig);
    }

    getAddressUrl(chainId: number, address: Address): string | undefined {
        return EVMExplorerResolver.addressLink(chainId, address);
    }

    getTransactionUrl(chainId: number, hash: Hash): string | undefined {
        return EVMExplorerResolver.transactionLink(chainId, hash);
    }
}

export const evmNetwork = new EVMNetwork();
