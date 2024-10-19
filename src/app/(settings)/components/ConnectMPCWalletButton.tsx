import { safeUnreachable } from '@masknet/kit';
import { isSameAddress } from '@masknet/web3-shared-base';
import { ChainId } from '@masknet/web3-shared-evm';
import { useWallet } from '@solana/wallet-adapter-react';
import { connect } from '@wagmi/core';
import { useAsyncFn } from 'react-use';
import { useAccount } from 'wagmi';

import { createParticleConnector } from '@/app/connectors/ParticleConnector.js';
import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { config } from '@/configs/wagmiClient.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface ConnectMPCWalletButtonProps {
    connection: FireflyWalletConnection;
}

export function ConnectMPCWalletButton({ connection }: ConnectMPCWalletButtonProps) {
    const account = useAccount();
    const wallet = useWallet();

    const [{ loading }, connectMPCWallet] = useAsyncFn(async () => {
        try {
            const connector = createParticleConnector({});
            if (!connector) throw new Error('Failed to create connector.');

            await connect(config, {
                chainId: ChainId.Mainnet,
                connector,
            });
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, 'Failed to connect MPC wallet'), {
                error,
            });
            throw error;
        }
    }, [connection]);

    // already connected
    switch (connection.platform) {
        case 'eth':
            if (isSameAddress(account.address, connection.address)) return null;
            break;
        case 'solana':
            if (isSameAddress(wallet.publicKey?.toBase58(), connection.address)) return null;
            break;
        default:
            safeUnreachable(connection.platform);
            break;
    }

    return loading ? (
        <LoadingIcon width={20} height={20} />
    ) : (
        <ClickableButton onClick={connectMPCWallet} className="text-medium font-bold text-lightMain">
            Connect
        </ClickableButton>
    );
}
