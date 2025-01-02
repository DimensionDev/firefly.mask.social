import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useQueryClient } from '@tanstack/react-query';
import bs58 from 'bs58';
import { forwardRef, useCallback, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { disconnect } from 'wagmi/actions';

import { config } from '@/configs/wagmiClient.js';
import { FetchError } from '@/constants/error.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { enqueueInfoMessage, enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { formatEthereumAddress, formatSolanaAddress } from '@/helpers/formatAddress.js';
import { getWalletClientRequired } from '@/helpers/getWalletClientRequired.js';
import { isSameEthereumAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';
import { useSingletonModal } from '@/hooks/useSingletonModal.js';
import type { SingletonModalRefCreator } from '@/libs/SingletonModal.js';
import { ConnectWalletModalUI } from '@/modals/ConnectWalletModal.js';
import { AccountModalRef } from '@/modals/controls.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { BindWalletResponse, FireflyWalletConnection } from '@/providers/types/Firefly.js';

export interface AddWalletModalProps {
    connections: FireflyWalletConnection[];
    platform?: 'evm' | 'solana';
}

export interface AddWalletModalCloseProps {
    response?: BindWalletResponse['data'];
}

export const AddWalletModal = forwardRef<SingletonModalRefCreator<AddWalletModalProps, AddWalletModalCloseProps>>(
    function AddWalletModal(_, ref) {
        const { publicKey, signMessage } = useWallet();
        const wallet = useWalletModal();
        const [{ connections, platform }, setProps] = useState<AddWalletModalProps>({
            connections: EMPTY_LIST,
        });
        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                setProps(props);
                if (props.platform) {
                    onBind(props.platform);
                }
            },
            onClose: () => setProps({ connections: EMPTY_LIST }),
        });
        const onClose = useCallback((props: AddWalletModalCloseProps = {}) => dispatch?.close(props), [dispatch]);

        const onBindEvmAddress = useCallback(async () => {
            await disconnect(config);
            const walletClient = await getWalletClientRequired(config);
            const address = walletClient.account.address;
            const existedConnection = connections.find((connection) =>
                isSameEthereumAddress(connection.address, address),
            );
            if (existedConnection) {
                const addressName = existedConnection.ens?.[0] || formatEthereumAddress(address, 8);
                AccountModalRef.open();
                enqueueInfoMessage(t`${addressName} is already connected.`);
                return;
            }
            const message = await FireflyEndpointProvider.getMessageToSignForBindWallet(address.toLowerCase());
            const signature = await walletClient.signMessage({
                message: { raw: message },
                account: address,
            });
            return await FireflyEndpointProvider.verifyAndBindWallet(message, signature);
        }, [connections]);
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
                    let result: BindWalletResponse['data'] | undefined;
                    switch (platform) {
                        case 'evm':
                            result = await onBindEvmAddress();
                            if (!result) return;
                            break;
                        case 'solana':
                            result = await onBindSolanaAddress();
                            if (!result) return;
                            break;
                        default:
                            safeUnreachable(platform);
                            break;
                    }
                    await qc.refetchQueries({ queryKey: ['my-wallet-connections'] });
                    enqueueSuccessMessage(t`Wallet added successfully`);
                    onClose({ response: result });
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

                    const messageFromError = error instanceof FetchError ? error.text : '';
                    enqueueMessageFromError(error, messageFromError || t`Failed to add wallet`);
                    throw error;
                }
            },
            [onBindEvmAddress, onBindSolanaAddress, onClose, qc],
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
