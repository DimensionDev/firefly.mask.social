import { EVMExplorerResolver } from '@masknet/web3-providers';
import type { ChainId } from '@masknet/web3-shared-evm';
import { getAccount, getChainId, switchChain } from '@wagmi/core';
import { type Address, type Hash } from 'viem';

import { chains, config } from '@/configs/wagmiClient.js';
import { NotImplementedError } from '@/constants/error.js';
import type { NetworkProvider } from '@/providers/types/Network.js';

class Provider implements NetworkProvider<ChainId, Address, Hash> {
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

    async switchChain(chainId: ChainId): Promise<void> {
        const chain = chains.find((chain) => chain.id === chainId);
        await switchChain(config, {
            chainId,
            addEthereumChainParameter: chain
                ? {
                      chainName: chain.name,
                      nativeCurrency: chain.nativeCurrency,
                      rpcUrls: chain.rpcUrls.default.http,
                      blockExplorerUrls: [chain.blockExplorers.default.url],
                  }
                : undefined,
        });
    }

    getChainId(): ChainId {
        return getChainId(config);
    }

    getAddressUrl(chainId: ChainId, address: Address): string | undefined {
        return EVMExplorerResolver.addressLink(chainId, address);
    }

    getTransactionUrl(chainId: ChainId, hash: Hash): string | undefined {
        return EVMExplorerResolver.transactionLink(chainId, hash);
    }
}

export const EthereumNetwork = new Provider();
