import { EVMExplorerResolver } from '@masknet/web3-providers';
import { getAccount, getChainId, switchChain } from '@wagmi/core';
import { type Address, type Hash } from 'viem';

import { config } from '@/configs/wagmiClient.js';
import { NotImplementedError } from '@/constants/error.js';
import type { NetworkProvider as NetworkProvider } from '@/providers/types/Network.js';

class Provider implements NetworkProvider<Address, Hash> {
    async connect(): Promise<void> {
        throw new NotImplementedError();
    }

    async getAccount(): Promise<Address> {
        const account = getAccount(config);
        if (!account.address) {
            throw new Error('Wallet not connected');
        }
        return account.address;
    }

    async switchChain(chainId: number): Promise<void> {
        await switchChain(config, { chainId });
    }

    getChainId(): number {
        return getChainId(config);
    }

    getAddressUrl(chainId: number, address: Address): string | undefined {
        return EVMExplorerResolver.addressLink(chainId, address);
    }

    getTransactionUrl(chainId: number, hash: Hash): string | undefined {
        return EVMExplorerResolver.transactionLink(chainId, hash);
    }
}

export const EthereumNetwork = new Provider();
