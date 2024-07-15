import { ChainId } from '@masknet/web3-shared-solana';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

import { NotImplementedError } from '@/constants/error.js';
// eslint-disable-next-line no-restricted-imports
import { SolanaExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Solana/apis/ResolverAPI.js';
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

    switchChain(chainId: ChainId): Promise<void> {
        throw new NotImplementedError();
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
