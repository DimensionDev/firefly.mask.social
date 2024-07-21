import { isGreaterThan, rightShift } from '@masknet/web3-shared-base';
import { ChainId, isNativeTokenAddress } from '@masknet/web3-shared-solana';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import { env } from '@/constants/env.js';
import { createTransferInstruction } from '@/providers/solana/createTransferInstruction.js';
import { getOrCreateAssociatedTokenAccount } from '@/providers/solana/getOrCreateAssociatedTokenAccount.js';
import { getNativeTokenBalance, getTokenBalance } from '@/providers/solana/getTokenBalance.js';
import { SolanaNetwork } from '@/providers/solana/Network.js';
import { resolveWalletAdapter } from '@/providers/solana/resolveWalletAdapter.js';
import type { Token, TransactionOptions, TransferProvider } from '@/providers/types/Transfer.js';

class Provider implements TransferProvider<ChainId> {
    private connection = new Connection(env.external.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');

    async transfer(options: TransactionOptions<ChainId>): Promise<string> {
        const { token } = options;
        let signature: string;

        await SolanaNetwork.connect();

        if (!token || this.isNativeToken(token)) {
            signature = await this.transferNative(options);
        } else {
            signature = await this.transferContract({ ...options, token });
        }
        await this.connection.confirmTransaction(signature, 'processed');
        return signature;
    }

    isNativeToken(token: Token<ChainId>): boolean {
        return isNativeTokenAddress(token.id);
    }

    async validateBalance({ token, amount }: TransactionOptions<ChainId>): Promise<boolean> {
        const balance = await getTokenBalance(token, await SolanaNetwork.getAccount(), ChainId.Mainnet);
        return !isGreaterThan(rightShift(amount, token.decimals), balance.value);
    }

    async validateGas(options: TransactionOptions<ChainId>): Promise<boolean> {
        const nativeBalance = await getNativeTokenBalance(await SolanaNetwork.getAccount(), ChainId.Mainnet);
        let transaction: Transaction;
        if (this.isNativeToken(options.token)) {
            transaction = await this.getNativeTransferTransaction(options);
        } else {
            transaction = await this.getSplTransferTransaction(options);
        }
        const fees = await transaction.getEstimatedFee(this.connection);
        return fees !== null ? !isGreaterThan(fees, nativeBalance.value) : false;
    }

    async getAvailableBalance({ token }: TransactionOptions<ChainId>): Promise<string> {
        const account = await SolanaNetwork.getAccount();
        const balance = await getTokenBalance(token, account, ChainId.Mainnet);
        return balance.value;
    }

    private async transferNative(options: TransactionOptions<ChainId>): Promise<string> {
        const adapter = resolveWalletAdapter();
        const account = await SolanaNetwork.getAccount();

        const transaction = await this.getNativeTransferTransaction(options);
        const blockHash = await this.connection.getLatestBlockhash();
        transaction.feePayer = new PublicKey(account);
        transaction.recentBlockhash = blockHash.blockhash;

        const signature = await adapter.sendTransaction(transaction, this.connection);
        await this.connection.confirmTransaction(signature, 'processed');

        return signature;
    }

    private async transferContract(options: TransactionOptions<ChainId>): Promise<string> {
        const adapter = resolveWalletAdapter();
        const account = await SolanaNetwork.getAccount();

        const transaction = await this.getSplTransferTransaction(options);
        const blockHash = await this.connection.getLatestBlockhash();
        transaction.feePayer = new PublicKey(account);
        transaction.recentBlockhash = blockHash.blockhash;

        const signature = await adapter.sendTransaction(transaction, this.connection);
        await this.connection.confirmTransaction(signature, 'processed');

        return signature;
    }

    private async getNativeTransferTransaction(options: TransactionOptions<ChainId>) {
        return new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(await SolanaNetwork.getAccount()),
                toPubkey: new PublicKey(options.to),
                lamports: Number.parseInt(options.amount, 10),
            }),
        );
    }

    private async getSplTransferTransaction(options: TransactionOptions<ChainId>) {
        const adapter = resolveWalletAdapter();
        const accountPublicKey = new PublicKey(await SolanaNetwork.getAccount());

        const recipientPubkey = new PublicKey(options.to);
        const mintPubkey = new PublicKey(options.token.id);
        function signTransaction(transaction: Transaction) {
            return adapter.signTransaction(transaction);
        }
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            this.connection,
            accountPublicKey,
            mintPubkey,
            accountPublicKey,
            signTransaction,
        );
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            this.connection,
            accountPublicKey,
            mintPubkey,
            recipientPubkey,
            signTransaction,
        );

        return new Transaction().add(
            createTransferInstruction(
                fromTokenAccount.address,
                toTokenAccount.address,
                accountPublicKey,
                Number.parseInt(options.amount, 10),
            ),
        );
    }
}

export const SolanaTransfer = new Provider();
