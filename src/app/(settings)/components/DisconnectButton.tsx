import { t } from '@lingui/macro';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { useAsyncFn } from 'react-use';

import DisconnectIcon from '@/assets/disconnect.svg';
import LoadingIcon from '@/assets/loading.svg';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getFireflyIdentityForDisconnect, updateAccountConnection } from '@/helpers/formatWalletConnection.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveProfilesByIdentities } from '@/helpers/resolveProfilesByIdentities.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';
import { waitForDisconnectConfirmation } from '@/app/(settings)/components/waitForDisconnectConfirmation.js';

interface DisconnectButtonProps {
    connection: FireflyWalletConnection;
}

export function DisconnectButton({ connection }: DisconnectButtonProps) {
    const router = useRouter();

    const [{ loading }, disconnectWallet] = useAsyncFn(async () => {
        try {
            const relatedProfiles = await resolveProfilesByIdentities(connection.identities);
            const confirmed = await waitForDisconnectConfirmation(connection, compact(relatedProfiles));
            if (!confirmed) return;
            const identity = getFireflyIdentityForDisconnect(connection);
            if (!identity) {
                throw new Error('No profile tab found for disconnecting wallet');
            }
            await FireflySocialMediaProvider.disconnectAccount(identity, connection.address);
            await updateAccountConnection(identity);
            router.push('/');
            enqueueSuccessMessage(t`Disconnected from your social graph`);
        } catch (error) {
            enqueueErrorMessage(
                getSnackbarMessageFromError(error, t`Failed to disconnect wallet from your social graph.`),
                { error },
            );
            throw error;
        }
    }, [connection, router]);

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
