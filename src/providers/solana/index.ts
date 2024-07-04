import { isGreaterThan, rightShift } from '@masknet/web3-shared-base';
import { isNativeTokenAddress } from '@masknet/web3-shared-solana';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import { env } from '@/constants/env.js';
import { SOLANA_WALLET_CACHE_KEY } from '@/constants/index.js';
// eslint-disable-next-line no-restricted-imports
import { SolanaExplorerResolver } from '@/maskbook/packages/web3-providers/src/Web3/Solana/apis/ResolverAPI.js';
import { createTransferInstruction } from '@/providers/solana/createTransferInstruction.js';
import { getOrCreateAssociatedTokenAccount } from '@/providers/solana/getOrCreateAssociatedTokenAccount.js';
import { getNativeTokenBalance, getTokenBalance } from '@/providers/solana/getTokenBalance.js';
import { resolveSolanaWalletAdapter } from '@/providers/solana/resolveSolanaWalletAdapter.js';
import { ChainId } from '@/providers/types/Solana.js';
import type { Token, Transfer, TransferOptions } from '@/providers/types/Transfer.js';

export const Endpoints: Record<ChainId, string> = {
    [ChainId.Mainnet]: env.external.NEXT_PUBLIC_SOLANA_RPC_URL,
    [ChainId.Testnet]: 'https://api.testnet.solana.com',
    [ChainId.Devnet]: 'https://api.devnet.solana.com',
};

let walletName: string;
let adapter: CoinbaseWalletAdapter | null = null;

const defaultChain = ChainId.Mainnet;

function resolveWalletAdapter() {
    const currentName = localStorage.getItem(SOLANA_WALLET_CACHE_KEY);
    if (!adapter || (walletName && currentName && walletName !== currentName)) {
        const NewAdapter = resolveSolanaWalletAdapter(currentName!);
        if (NewAdapter) {
            adapter = new NewAdapter();
            walletName = currentName!;
        } else {
            adapter = null;
            walletName = '';
        }
    }

    if (!currentName) {
        adapter = null;
        walletName = '';
    }

    if (!adapter) {
        throw new WalletNotConnectedError();
    }

    return adapter;
}

class SolanaTransfer implements Transfer<Connection, string> {
    _config: Connection;
    constructor(chainId: ChainId) {
        this._config = new Connection(Endpoints[chainId], 'confirmed');
    }

    async transfer(options: TransferOptions<string>): Promise<string> {
        const { token } = options;
        let signature: string;

        await this.connect();

        if (!token || this.isNativeToken(token)) {
            signature = await this._transferNative(options);
        } else {
            signature = await this._transferContract({ ...options, token });
        }

        await this.waitForTransaction(signature);
        return signature;
    }

    isNativeToken(token: Token<string>): boolean {
        return isNativeTokenAddress(token.id);
    }

    async waitForTransaction(signature: string): Promise<void> {
        await this._config.confirmTransaction(signature, 'processed');
    }

    async connect() {
        const adapter = resolveWalletAdapter();
        if (!adapter.connected) {
            await adapter.connect();
        }
    }

    async validateBalance({ token, amount }: TransferOptions<string>): Promise<boolean> {
        const balance = await getTokenBalance(token, this.getAccount(), defaultChain);
        return !isGreaterThan(rightShift(amount, token.decimals), balance.value);
    }

    async validateGas(options: TransferOptions<string>): Promise<boolean> {
        const nativeBalance = await getNativeTokenBalance(this.getAccount(), defaultChain);
        let transaction: Transaction;
        if (this.isNativeToken(options.token)) {
            transaction = await this._getNativeTransferTransaction(options);
        } else {
            transaction = await this._getSplTransferTransaction(options);
        }
        const fees = await transaction.getEstimatedFee(this._config);
        return fees !== null ? !isGreaterThan(fees, nativeBalance.value) : false;
    }

    getAccount(): string {
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

    async _transferNative(options: TransferOptions<string>): Promise<string> {
        const adapter = resolveWalletAdapter();
        if (!adapter.publicKey) throw new WalletNotConnectedError();

        const transaction = await this._getNativeTransferTransaction(options);
        const blockHash = await this._config.getLatestBlockhash();
        transaction.feePayer = adapter.publicKey;
        transaction.recentBlockhash = blockHash.blockhash;

        const signature = await adapter.sendTransaction(transaction, this._config);

        await this.waitForTransaction(signature);

        return signature;
    }

    async _transferContract(options: TransferOptions<string>): Promise<string> {
        const adapter = resolveWalletAdapter();
        if (!adapter.publicKey) throw new WalletNotConnectedError();

        const transaction = await this._getSplTransferTransaction(options);
        const blockHash = await this._config.getLatestBlockhash();
        transaction.feePayer = adapter.publicKey;
        transaction.recentBlockhash = blockHash.blockhash;

        const signature = await adapter.sendTransaction(transaction, this._config);

        await this.waitForTransaction(signature);

        return signature;
    }

    async _getNativeTransferTransaction(options: TransferOptions<string>) {
        return new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(this.getAccount()),
                toPubkey: new PublicKey(options.to),
                lamports: Number.parseInt(options.amount, 10),
            }),
        );
    }

    async _getSplTransferTransaction(options: TransferOptions<string>) {
        const adapter = resolveWalletAdapter();
        if (!adapter.publicKey) throw new WalletNotConnectedError();

        const recipientPubkey = new PublicKey(options.to);
        const mintPubkey = new PublicKey(options.token.id);
        function signTransaction(transaction: Transaction) {
            return adapter.signTransaction(transaction);
        }
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            this._config,
            adapter.publicKey,
            mintPubkey,
            adapter.publicKey,
            signTransaction,
        );
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            this._config,
            adapter.publicKey,
            mintPubkey,
            recipientPubkey,
            signTransaction,
        );

        return new Transaction().add(
            createTransferInstruction(
                fromTokenAccount.address,
                toTokenAccount.address,
                adapter.publicKey,
                Number.parseInt(options.amount, 10),
            ),
        );
    }
}

export const solanaTransfer = new SolanaTransfer(defaultChain);
