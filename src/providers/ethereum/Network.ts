import type { ChainId } from '@masknet/web3-shared-evm';
import { type Address, type Hash } from 'viem';
import { getAccount, getChainId } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { NotImplementedError } from '@/constants/error.js';
import { EVMExplorerResolver } from '@/mask/bindings/index.js';
import { BlockScanExplorerResolver } from '@/providers/ethereum/ExplorerResolver.js';
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

    getChainId(): ChainId {
        return getChainId(config);
    }

    getAddressUrl(chainId: ChainId, address: Address): string | undefined {
        return BlockScanExplorerResolver.addressLink(chainId, address);
    }

    getTransactionUrl(chainId: ChainId, hash: Hash): string | undefined {
        return EVMExplorerResolver.transactionLink(chainId, hash);
    }
}

export const EthereumNetwork = new Provider();
