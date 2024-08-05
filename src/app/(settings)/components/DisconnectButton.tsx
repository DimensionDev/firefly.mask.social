import { t } from '@lingui/macro';
import { compact } from 'lodash-es';
import { useRouter } from 'next/navigation.js';
import { useAsyncFn } from 'react-use';

import { waitForDisconnectConfirmation } from '@/app/(settings)/components/WaitForDisconnectConfirmation.js';
import DisconnectIcon from '@/assets/disconnect.svg';
import LoadingIcon from '@/assets/loading.svg';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getFireflyIdentityForDisconnect, updateAccountConnection } from '@/helpers/formatWalletConnection.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveProfilesByIdentities } from '@/helpers/resolveProfilesByIdentities.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyWalletConnection } from '@/providers/types/Firefly.js';

interface DisconnectButtonProps {
    connection: FireflyWalletConnection;
}

export function DisconnectButton({ connection }: DisconnectButtonProps) {
    const router = useRouter();

    const [{ loading }, disconnectWallet] = useAsyncFn(async () => {
        try {
            const relatedProfiles = await resolveProfilesByIdentities(connection.platforms);
            const confirmed = await waitForDisconnectConfirmation(connection, compact(relatedProfiles));
            if (!confirmed) return;
            const profileTab = getFireflyIdentityForDisconnect(connection);
            if (!profileTab) {
                throw new Error('No profile tab found for disconnecting wallet');
            }
            await FireflySocialMediaProvider.disconnectAccount(
                profileTab.source,
                profileTab.identity,
                connection.address,
            );
            await updateAccountConnection(profileTab.source, profileTab.identity);
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
