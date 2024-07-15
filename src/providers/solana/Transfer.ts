import { isGreaterThan, rightShift } from '@masknet/web3-shared-base';
import { isNativeTokenAddress } from '@masknet/web3-shared-solana';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import { SOLANA_DEFAULT_CHAIN } from '@/constants/chain.js';
import { env } from '@/constants/env.js';
import { createTransferInstruction } from '@/providers/solana/createTransferInstruction.js';
import { getOrCreateAssociatedTokenAccount } from '@/providers/solana/getOrCreateAssociatedTokenAccount.js';
import { getNativeTokenBalance, getTokenBalance } from '@/providers/solana/getTokenBalance.js';
import { solanaNetwork } from '@/providers/solana/Network.js';
import { resolveWalletAdapter } from '@/providers/solana/resolveWalletAdapter.js';
import type { Token, TransactionOptions, Transfer } from '@/providers/types/Transfer.js';

const connection = new Connection(env.external.NEXT_PUBLIC_SOLANA_RPC_URL, 'confirmed');

class SolanaTransfer implements Transfer {
    async transfer(options: TransactionOptions<string>): Promise<string> {
        const { token } = options;
        let signature: string;

        await solanaNetwork.connect();

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
        await connection.confirmTransaction(signature, 'processed');
    }

    async validateBalance({ token, amount }: TransactionOptions<string>): Promise<boolean> {
        const balance = await getTokenBalance(token, await solanaNetwork.getAccount(), SOLANA_DEFAULT_CHAIN);
        return !isGreaterThan(rightShift(amount, token.decimals), balance.value);
    }

    async validateGas(options: TransactionOptions<string>): Promise<boolean> {
        const nativeBalance = await getNativeTokenBalance(await solanaNetwork.getAccount(), SOLANA_DEFAULT_CHAIN);
        let transaction: Transaction;
        if (this.isNativeToken(options.token)) {
            transaction = await this._getNativeTransferTransaction(options);
        } else {
            transaction = await this._getSplTransferTransaction(options);
        }
        const fees = await transaction.getEstimatedFee(connection);
        return fees !== null ? !isGreaterThan(fees, nativeBalance.value) : false;
    }

    async _transferNative(options: TransactionOptions<string>): Promise<string> {
        const adapter = resolveWalletAdapter();
        const account = await solanaNetwork.getAccount();

        const transaction = await this._getNativeTransferTransaction(options);
        const blockHash = await connection.getLatestBlockhash();
        transaction.feePayer = new PublicKey(account);
        transaction.recentBlockhash = blockHash.blockhash;

        const signature = await adapter.sendTransaction(transaction, connection);

        await this.waitForTransaction(signature);

        return signature;
    }

    async _transferContract(options: TransactionOptions<string>): Promise<string> {
        const adapter = resolveWalletAdapter();
        const account = await solanaNetwork.getAccount();

        const transaction = await this._getSplTransferTransaction(options);
        const blockHash = await connection.getLatestBlockhash();
        transaction.feePayer = new PublicKey(account);
        transaction.recentBlockhash = blockHash.blockhash;

        const signature = await adapter.sendTransaction(transaction, connection);

        await this.waitForTransaction(signature);

        return signature;
    }

    async _getNativeTransferTransaction(options: TransactionOptions<string>) {
        return new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(await solanaNetwork.getAccount()),
                toPubkey: new PublicKey(options.to),
                lamports: Number.parseInt(options.amount, 10),
            }),
        );
    }

    async _getSplTransferTransaction(options: TransactionOptions<string>) {
        const adapter = resolveWalletAdapter();
        const accountPublicKey = new PublicKey(await solanaNetwork.getAccount());

        const recipientPubkey = new PublicKey(options.to);
        const mintPubkey = new PublicKey(options.token.id);
        function signTransaction(transaction: Transaction) {
            return adapter.signTransaction(transaction);
        }
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            accountPublicKey,
            mintPubkey,
            accountPublicKey,
            signTransaction,
        );
        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
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

export const solanaTransfer = new SolanaTransfer();
