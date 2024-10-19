import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { isSameAddress } from '@masknet/web3-shared-base';
import { ChainId } from '@masknet/web3-shared-evm';
import { useWallet } from '@solana/wallet-adapter-react';
import { connect, disconnect } from '@wagmi/core';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import { createParticleConnector } from '@/app/connectors/ParticleConnector.js';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { config } from '@/configs/wagmiClient.js';
import { NotImplementedError } from '@/constants/error.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveValue } from '@/helpers/resolveValue.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface ConnectMPCWalletButtonProps {
    connection: FireflyWalletConnection;
}

export function ConnectMPCWalletButton({ connection }: ConnectMPCWalletButtonProps) {
    const account = useAccount();
    const wallet = useWallet();

    const [{ loading }, updateConnection] = useAsyncFn(
        async (isConnected: boolean) => {
            try {
                switch (connection.platform) {
                    case 'eth': {
                        const connector = createParticleConnector({});
                        if (!connector) throw new Error('Failed to create connector.');

                        if (isConnected) {
                            await disconnect(config);
                        } else {
                            await connect(config, {
                                chainId: ChainId.Mainnet,
                                connector,
                            });
                        }
                        break;
                    }
                    case 'solana':
                        throw new NotImplementedError();
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
        [connection],
    );

    if (loading) return <LoadingIcon className="animate-spin" width={20} height={20} />;

    const connected = resolveValue(() => {
        switch (connection.platform) {
            case 'eth':
                if (isSameAddress(account.address, connection.address)) return true;
                return false;
            case 'solana':
                if (isSameAddress(wallet.publicKey?.toBase58(), connection.address)) return true;
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
