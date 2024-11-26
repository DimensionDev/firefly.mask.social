import { ChainId } from '@masknet/web3-shared-solana';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

import { SolanaExplorerResolver } from '@/mask/bindings/index.js';
import { resolveWalletAdapter } from '@/providers/solana/resolveWalletAdapter.js';
import type { NetworkProvider as NetworkProvider } from '@/providers/types/Network.js';

class Provider implements NetworkProvider<ChainId> {
    async connect() {
        const adapter = resolveWalletAdapter();
        if (!adapter.connected) {
            await adapter.connect();
        }
    }

    async getAccount(): Promise<string> {
        await this.connect();

        const adapter = resolveWalletAdapter();
        if (!adapter.publicKey) throw new WalletNotConnectedError();

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
