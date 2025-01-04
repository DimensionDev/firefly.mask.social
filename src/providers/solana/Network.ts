import { ChainId } from '@masknet/web3-shared-solana';

import { SolanaExplorerResolver } from '@/mask/index.js';
import { getWalletAdapter, getWalletAdaptorConnected } from '@/providers/solana/getWalletAdapter.js';
import type { NetworkProvider as NetworkProvider } from '@/providers/types/Network.js';

class Provider implements NetworkProvider<ChainId> {
    async connect() {
        const adapter = getWalletAdapter();
        if (!adapter.connected) await adapter.connect();
    }

    async getAccount(): Promise<string> {
        await this.connect();

        const adapter = getWalletAdaptorConnected();
        return adapter.publicKey.toBase58();
    }

    getChainId(): ChainId {
        return ChainId.Mainnet;
    }

    getAddressUrl(chainId: ChainId, token: string): string | undefined {
        return SolanaExplorerResolver.addressLink(chainId, token);
    }

    getTransactionUrl(chainId: ChainId, hash: string): string | undefined {
        return SolanaExplorerResolver.transactionLink(chainId, hash);
    }
}

export const SolanaNetwork = new Provider();
