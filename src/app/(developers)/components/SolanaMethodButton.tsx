'use client';

import { Trans } from '@lingui/macro';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import bs58 from 'bs58';
import { useAsyncFn } from 'react-use';

import { SolanaMethodType } from '@/app/(developers)/developers/solana/page.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { SITE_DESCRIPTION } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueInfoMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';

export function SolanaMethodButton({ method }: { method: SolanaMethodType }) {
    const wallet = useWallet();
    const walletModal = useWalletModal();

    const [{ loading }, onClick] = useAsyncFn(async () => {
        try {
            if (!wallet.connected || !wallet.publicKey) {
                walletModal.setVisible(true);
                return;
            }
            switch (method) {
                case SolanaMethodType.GET_ACCOUNT: {
                    enqueueInfoMessage(wallet.publicKey?.toBase58());
                    break;
                }
                case SolanaMethodType.SIGN_MESSAGE: {
                    if (!wallet.signMessage) {
                        enqueueErrorMessage('Sign message not supported');
                        break;
                    }
                    const message = bs58.decode(bs58.encode(Buffer.from(SITE_DESCRIPTION, 'utf-8')));
                    const signed = await wallet.signMessage(message);
                    enqueueInfoMessage(signed);
                    break;
                }
            }
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, 'Failed to execute method'), {
                error,
            });
            throw error;
        }
    }, [wallet, walletModal, method]);

    return (
        <ClickableButton
            className="rounded-md bg-main px-2 py-1 text-primaryBottom"
            disabled={loading}
            onClick={() => {
                onClick();
            }}
        >
            <Trans>Invoke</Trans>
        </ClickableButton>
    );
}
