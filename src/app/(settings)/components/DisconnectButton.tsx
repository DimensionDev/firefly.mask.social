import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { waitForDisconnectConfirmation } from '@/app/(settings)/components/waitForDisconnectConfirmation.js';
import DisconnectIcon from '@/assets/disconnect.svg';
import LoadingIcon from '@/assets/loading.svg';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';
import { disconnectFirefly } from '@/services/disconnectFirefly.js';

interface DisconnectButtonProps {
    connection: FireflyWalletConnection;
}

export function DisconnectButton({ connection }: DisconnectButtonProps) {
    const [{ loading }, disconnectWallet] = useAsyncFn(async () => {
        try {
            const confirmed = await waitForDisconnectConfirmation(connection);
            if (!confirmed) return;

            await disconnectFirefly(connection);

            enqueueSuccessMessage(t`Disconnected from your social graph`);
        } catch (error) {
            enqueueErrorMessage(
                getSnackbarMessageFromError(error, t`Failed to disconnect wallet from your social graph.`),
                { error },
            );
            throw error;
        }
    }, [connection]);

    return (
        <span>
            {loading ? (
                <LoadingIcon className="animate-spin" width={20} height={20} />
            ) : (
                <DisconnectIcon onClick={disconnectWallet} className="cursor-pointer" width={20} height={20} />
            )}
        </span>
    );
}
