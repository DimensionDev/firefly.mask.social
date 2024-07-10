import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Connection } from '@solana/web3.js';

import { SUPPORTED_SOLANA_CHAIN_IDS as ChainId } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
// eslint-disable-next-line no-restricted-imports
import { SolanaExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Solana/apis/ResolverAPI.js';
import { resolveWalletAdapter } from '@/providers/solana/resolveWalletAdapter.js';
import type { Provider as NetworkProvider } from '@/providers/types/network.js';

export const Endpoints: Record<ChainId, string> = {
    [ChainId.Mainnet]: env.external.NEXT_PUBLIC_SOLANA_RPC_URL,
    [ChainId.Testnet]: 'https://api.testnet.solana.com',
    [ChainId.Devnet]: 'https://api.devnet.solana.com',
};

const defaultChain = ChainId.Mainnet;


export class SolanaNetwork implements NetworkProvider<Connection, string, string> {
    _config: Connection;
    constructor(chainId: ChainId) {
        this._config = new Connection(Endpoints[chainId], 'confirmed');
    }

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
        throw new Error('Method not implemented.');
    }

    getChainId(): number {
        return defaultChain;
    }

    getAddressUrl(chainId: number, token: string): string | undefined {
        return SolanaExplorerResolver.addressLink(chainId, token);
    }

    getTransactionUrl(chainId: number, hash: string): string | undefined {
        return SolanaExplorerResolver.transactionLink(chainId, hash);
    }
}
