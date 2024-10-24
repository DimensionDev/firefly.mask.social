import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useSingletonModal } from '@masknet/shared-base-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useQueryClient } from '@tanstack/react-query';
import bs58 from 'bs58';
import { forwardRef, useCallback, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { useAccount, useSignMessage } from 'wagmi';

import { EMPTY_LIST } from '@/constants/index.js';
import { enqueueErrorMessage, enqueueInfoMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress, formatSolanaAddress } from '@/helpers/formatAddress.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameEthereumAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConnectWalletModalUI } from '@/modals/ConnectWalletModal.js';
import { AccountModalRef, ConnectModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

export interface AddWalletModalProps {
    connections: FireflyWalletConnection[];
}

export const AddWalletModal = forwardRef<SingletonModalRefCreator<AddWalletModalProps>>(
    function AddWalletModal(_, ref) {
        const account = useAccount();
        const { signMessageAsync } = useSignMessage();
        const { publicKey, signMessage } = useWallet();
        const wallet = useWalletModal();
        const [{ connections }, setProps] = useState<AddWalletModalProps>({
            connections: EMPTY_LIST,
        });
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: setProps,
            onClose: () => setProps({ connections: EMPTY_LIST }),
        });
        const onClose = useCallback(() => dispatch?.close(), [dispatch]);
        const onBindEvmAddress = useCallback(async () => {
            const address = account.address;
            if (!account.isConnected || !address) {
                ConnectModalRef.open();
                return;
            }
            const existedConnection = connections.find((connection) =>
                isSameEthereumAddress(connection.address, address),
            );
            if (existedConnection) {
                const addressName = existedConnection.ens?.[0] || formatSolanaAddress(address, 8);
                AccountModalRef.open();
                enqueueInfoMessage(t`${addressName} is already connected.`);
                return;
            }
            const message = await FireflyEndpointProvider.getMessageToSignForBindWallet(address.toLowerCase());
            const signature = await signMessageAsync({ message: { raw: message }, account: address });
            return await FireflyEndpointProvider.verifyAndBindWallet(message, signature);
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
                const addressName = existedConnection.ens?.[0] || formatEthereumAddress(address, 8);
                enqueueInfoMessage(t`${addressName} is already connected.`);
                return;
            }
            const hexMessage = await FireflyEndpointProvider.getMessageToSignMessageForBindSolanaWallet(address);
            const message = bs58.decode(bs58.encode(Buffer.from(hexMessage.substring(2), 'hex')));
            const signature = Buffer.from(await signMessage(message)).toString('hex');
            return FireflyEndpointProvider.verifyAndBindSolanaWallet(address, hexMessage, signature);
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
                    if (
                        error instanceof Error &&
                        error.message.includes('This wallet already bound to the other account')
                    ) {
                        enqueueInfoMessage(
                            t`Sorry, this wallet is already linked to another Firefly account. Please try a different one.`,
                        );
                        throw error;
                    }

                    enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to add wallet`));
                    throw error;
                }
            },
            [onBindEvmAddress, onBindSolanaAddress],
        );

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
