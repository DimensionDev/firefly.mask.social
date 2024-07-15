import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

import { SOLANA_DEFAULT_CHAIN } from '@/constants/chain.js';
import { NotImplementedError } from '@/constants/error.js';
// eslint-disable-next-line no-restricted-imports
import { SolanaExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Solana/apis/ResolverAPI.js';
import { resolveWalletAdapter } from '@/providers/solana/resolveWalletAdapter.js';
import type { Provider as NetworkProvider } from '@/providers/types/Network.js';

class Provider implements NetworkProvider {
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

    switchChain(chainId: number): Promise<void> {
        throw new NotImplementedError();
    }

    getChainId(): number {
        return SOLANA_DEFAULT_CHAIN;
    }

    getAddressUrl(chainId: number, token: string): string | undefined {
        return SolanaExplorerResolver.addressLink(chainId, token);
    }

    getTransactionUrl(chainId: number, hash: string): string | undefined {
        return SolanaExplorerResolver.transactionLink(chainId, hash);
    }
}

export const SolanaNetwork = new Provider();
