import { EVMExplorerResolver } from '@masknet/web3-providers';
import { type Config, getAccount, getChainId, switchChain } from '@wagmi/core';
import { type Address, type Hash } from 'viem';

import type { Provider as NetworkProvider } from '@/providers/types/network.js';

export class EVMNetwork implements NetworkProvider<Config, Address, Hash> {
    _config: Config;
    constructor(config: Config) {
        this._config = config;
    }

    async connect(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async getAccount(): Promise<Address> {
        const account = getAccount(this._config);
        if (!account.address) {
            throw new Error('Wallet not connected');
        }
        return account.address;
    }

    async switchChain(chainId: number): Promise<void> {
        await switchChain(this._config, { chainId });
    }

    getChainId(): number {
        return getChainId(this._config);
    }

    getAddressUrl(chainId: number, address: Address): string | undefined {
        return EVMExplorerResolver.addressLink(chainId, address);
    }

    getTransactionUrl(chainId: number, hash: Hash): string | undefined {
        return EVMExplorerResolver.transactionLink(chainId, hash);
    }
}
