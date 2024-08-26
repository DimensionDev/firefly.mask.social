import { ActionConfig } from '@dialectlabs/blinks';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { useMemo } from 'react';

export function useActionAdapter() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const walletModal = useWalletModal();
    return useMemo(() => {
        return new ActionConfig(connection, {
            connect: async () => {
                try {
                    await wallet.connect();
                } catch {
                    walletModal.setVisible(true);
                    return null;
                }

                return wallet.publicKey?.toBase58() ?? null;
            },
            signTransaction: async (txData: string) => {
                try {
                    const tx = await wallet.sendTransaction(
                        VersionedTransaction.deserialize(Buffer.from(txData, 'base64')),
                        connection,
                    );
                    return { signature: tx };
                } catch {
                    return { error: 'Signing failed.' };
                }
            },
        });
    }, [connection, wallet, walletModal]);
}
