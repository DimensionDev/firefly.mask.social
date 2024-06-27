'use client';

import { useConnection, useWallet, type WalletContextState } from '@solana/wallet-adapter-react';
import { useWalletModal, type WalletModalContextState } from '@solana/wallet-adapter-react-ui';
import { type Connection, VersionedTransaction } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { Action } from '@/components/SolanaBlinkRenderer/api/Action.js';
import { type ActionAdapter } from '@/components/SolanaBlinkRenderer/api/ActionConfig.js';
import { ActionContainer } from '@/components/SolanaBlinkRenderer/ui/ActionContainer.js';

export class BlinkActionAdapter implements ActionAdapter {
    private connection: Connection;
    private wallet: WalletContextState;
    private walletModal: WalletModalContextState;

    constructor(connection: Connection, wallet: WalletContextState, walletModal: WalletModalContextState) {
        this.connection = connection;
        this.wallet = wallet;
        this.walletModal = walletModal;
    }

    async connect() {
        if (!this.wallet.connected) {
            this.walletModal.setVisible(true);
        }
        return this.wallet.publicKey?.toString() ?? '';
    }

    async signTransaction(tx: string) {
        try {
            const transaction = VersionedTransaction.deserialize(Buffer.from(tx, 'base64'));
            const {
                context: { slot: minContextSlot },
            } = await this.connection.getLatestBlockhashAndContext();
            return {
                signature: await this.wallet.sendTransaction(transaction, this.connection, { minContextSlot }),
            };
        } catch (error) {
            if (error instanceof Error) {
                return { error: error.message };
            }
            return { error: '' };
        }
    }

    async confirmTransaction(signature: string) {
        const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight },
        } = await this.connection.getLatestBlockhashAndContext();
        try {
            await this.connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
        } catch (error) {
            console.error(error);
        }
    }
}

export function SolanaBlinkRenderer(props: { url: string; onData?: (data: Action) => void }) {
    const { connection } = useConnection();
    const wallet = useWallet();
    const walletModal = useWalletModal();

    const query = useQuery({
        queryKey: ['blink', props.url],
        queryFn: async () => {
            const config = new BlinkActionAdapter(connection, wallet, walletModal);
            return Action.fetch(props.url, config);
        },
    });
    useEffect(() => {
        if (query.data) {
            props.onData?.(query.data);
        }
    }, [query.data]);

    if (!query.data) return null;
    const url = new URL(props.url);

    return <ActionContainer action={query.data} websiteText={url.hostname} websiteUrl={props.url} />;
}
