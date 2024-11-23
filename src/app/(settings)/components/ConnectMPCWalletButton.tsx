import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { ChainId } from '@masknet/web3-shared-evm';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal as useConnectModalSolana } from '@solana/wallet-adapter-react-ui';
import { connect, disconnect } from '@wagmi/core';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { config, particleConnector } from '@/configs/wagmiClient.js';
import { ParticleSolanaWalletAdapter } from '@/connectors/ParticleSolanaWallet.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { enqueueErrorMessage, enqueueInfoMessage } from '@/helpers/enqueueMessage.js';
import { formatSolanaAddress } from '@/helpers/formatAddress.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { isSameEthereumAddress, isSameSolanaAddress } from '@/helpers/isSameAddress.js';
import { resolveValue } from '@/helpers/resolveValue.js';
import { SolanaAccountModalRef } from '@/modals/controls.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface ConnectMPCWalletButtonProps {
    connection: FireflyWalletConnection;
}

export function ConnectMPCWalletButton({ connection }: ConnectMPCWalletButtonProps) {
    const account = useAccount();
    const wallet = useWallet();
    const connectModalSolana = useConnectModalSolana();

    const isFireflyWallet = wallet.wallet?.adapter instanceof ParticleSolanaWalletAdapter;

    const [{ loading }, updateConnection] = useAsyncFn(
        async (isConnected: boolean) => {
            try {
                switch (connection.platform) {
                    case 'eth': {
                        if (isConnected) {
                            await disconnect(config);
                        } else {
                            if (!particleConnector) throw new Error('Failed to create connector.');
                            await connect(config, {
                                chainId: ChainId.Mainnet,
                                connector: particleConnector,
                            });
                        }
                        break;
                    }
                    case 'solana':
                        if (!wallet.connected || !isFireflyWallet) {
                            enqueueInfoMessage(t`Please switch to Firefly Wallet.`, { autoHideDuration: 1000 * 10 });
                            connectModalSolana.setVisible(true);
                            return;
                        }
                        if (!isConnected) {
                            enqueueInfoMessage(t`Please try switching to ${formatSolanaAddress(connection.address)}`, {
                                autoHideDuration: 1000 * 10,
                            });
                            SolanaAccountModalRef.open();
                            return;
                        }
                        await wallet.disconnect();
                        return;
                    default:
                        safeUnreachable(connection.platform);
                }
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, 'Failed to connect MPC wallet'), {
                    error,
                });
                throw error;
            }
        },
        [connection, isFireflyWallet, wallet.connected, connection.address, wallet.disconnect],
    );

    if (env.external.NEXT_PUBLIC_PARTICLE !== STATUS.Enabled) return null;

    if (loading) return <LoadingIcon className="animate-spin" width={20} height={20} />;

    const connected = resolveValue(() => {
        switch (connection.platform) {
            case 'eth':
                if (isSameEthereumAddress(account.address, connection.address)) return true;
                return false;
            case 'solana':
                if (isSameSolanaAddress(wallet.publicKey?.toBase58(), connection.address)) return true;
                return false;
            default:
                safeUnreachable(connection.platform);
                return false;
        }
    });

    return (
        <ClickableButton onClick={() => updateConnection(connected)} className="text-medium font-bold text-lightMain">
            {connected ? <Trans>Disconnect</Trans> : <Trans>Connect</Trans>}
        </ClickableButton>
    );
}
