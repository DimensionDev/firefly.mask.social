import { useAsyncFn } from 'react-use';

import LoadingIcon from '@/assets/loading.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { NotImplementedError } from '@/constants/error.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface ConnectMPCWalletButtonProps {
    connection: FireflyWalletConnection;
}

export function ConnectMPCWalletButton({ connection }: ConnectMPCWalletButtonProps) {
    const [{ loading }, connectMPCWallet] = useAsyncFn(async () => {
        try {
            throw new NotImplementedError();
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, 'Failed to connect MPC wallet'), {
                error,
            });
            throw error;
        }
    }, [connection]);

    return loading ? (
        <LoadingIcon width={20} height={20} />
    ) : (
        <ClickableButton onClick={connectMPCWallet} className="text-medium font-bold text-lightMain">
            Connect
        </ClickableButton>
    );
}
