import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useQueryClient } from '@tanstack/react-query';
import bs58 from 'bs58';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, useSignMessage } from 'wagmi';

import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress, formatSolanaAddress } from '@/helpers/formatAddress.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameEthereumAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConnectWalletModalUI } from '@/modals/ConnectWalletModal.js';
import { AccountModalRef, ConnectModalRef } from '@/modals/controls.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

export interface AddWalletModalProps {
    connections: FireflyWalletConnection[];
    platform?: 'evm' | 'solana';
}

export const AddWalletModal = forwardRef<SingletonModalRefCreator<AddWalletModalProps>>(
    function AddWalletModal(_, ref) {
        const account = useAccount();
        const { signMessageAsync } = useSignMessage();
        const { publicKey, signMessage } = useWallet();
        const wallet = useWalletModal();
        const [{ connections, platform }, setProps] = useState<AddWalletModalProps>({
            connections: EMPTY_LIST,
        });
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: setProps,
            onClose: () => setProps({ connections: EMPTY_LIST }),
        });
        const onClose = useCallback(() => dispatch?.close(), [dispatch]);
        const [isConnecting, setIsConnecting] = useState(false);

        useEffect(() => {
            switch (platform) {
                case 'evm':
                    onBindEvmAddress().then(() => {
                        onClose();
                    });
                    break;
                case 'solana':
                    onBindSolanaAddress().then(() => {
                        onClose();
                    });
                    break;
            }
        }, [platform]);

        useEffect(() => {
            if (!isConnecting || !account.address) return;
            onBindEvmAddress();
        }, [account.address, isConnecting]);

        const onBindEvmAddress = useCallback(async () => {
            const address = account.address;
            if (!account.isConnected || !address) {
                ConnectModalRef.open();
                setIsConnecting(true);
                return;
            }
            setIsConnecting(false);
            const existedConnection = connections.find((connection) =>
                isSameEthereumAddress(connection.address, address),
            );
            if (existedConnection) {
                const addressName = existedConnection.ens?.[0] || formatEthereumAddress(address, 8);
                AccountModalRef.open();
                enqueueErrorMessage(t`${addressName} is already connected.`);
                return;
            }
            const message = await FireflySocialMediaProvider.getMessageToSignForBindWallet(address.toLowerCase());
            const signature = await signMessageAsync({ message: { raw: message }, account: address });
            return await FireflySocialMediaProvider.verifyAndBindWallet(message, signature);
        }, [account.address, account.isConnected, connections, signMessageAsync]);

        const onBindSolanaAddress = useCallback(async () => {
            const address = publicKey?.toBase58();
            if (!address || !signMessage) {
                wallet.setVisible(true);
                return;
            }
            const existedConnection = connections.find((connection) =>
                isSameSolanaAddress(connection.address, address),
            );
            if (existedConnection) {
                const addressName = existedConnection.ens?.[0] || formatSolanaAddress(address, 8);
                enqueueErrorMessage(t`${addressName} is already connected.`);
                return;
            }
            const hexMessage = await FireflySocialMediaProvider.getMessageToSignMessageForBindSolanaWallet(address);
            const message = bs58.decode(bs58.encode(Buffer.from(hexMessage.substring(2), 'hex')));
            const signature = Buffer.from(await signMessage(message)).toString('hex');
            return FireflySocialMediaProvider.verifyAndBindSolanaWallet(address, hexMessage, signature);
        }, [connections, publicKey, signMessage, wallet]);

        const qc = useQueryClient();

        const [{ loading }, onBind] = useAsyncFn(
            async (platform: 'evm' | 'solana') => {
                try {
                    switch (platform) {
                        case 'evm':
                            const evmRes = await onBindEvmAddress();
                            if (!evmRes) return;
                            break;
                        case 'solana':
                            const result = await onBindSolanaAddress();
                            if (!result) return;
                            break;
                        default:
                            safeUnreachable(platform);
                            break;
                    }
                    await qc.refetchQueries({ queryKey: ['my-wallet-connections'] });
                    enqueueSuccessMessage(t`Wallet added successfully`);
                    onClose();
                } catch (error) {
                    const messageFromError = error instanceof FetchError ? error.text : '';
                    enqueueErrorMessage(
                        getSnackbarMessageFromError(error, messageFromError || t`Failed to add wallet`),
                    );
                    throw error;
                }
            },
            [onBindEvmAddress, onBindSolanaAddress],
        );

        if (platform) return null;

        return (
            <ConnectWalletModalUI
                open={open}
                onClose={onClose}
                title={<Trans>Add Wallet</Trans>}
                loading={loading}
                onOpenSolanaDialog={() => onBind('solana')}
                onOpenEvmDialog={() => onBind('evm')}
            />
        );
    },
);
