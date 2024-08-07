import { t } from '@lingui/macro';
import { compact } from 'lodash-es';
import { useAsyncFn } from 'react-use';

import { waitForDisconnectConfirmation } from '@/app/(settings)/components/WaitForDisconnectConfirmation.js';
import DisconnectIcon from '@/assets/disconnect.svg';
import LoadingIcon from '@/assets/loading.svg';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';
import { getProfileById } from '@/services/getProfileById.js';

interface DisconnectButtonProps {
    profile: FireflyProfile;
    relations: FireflyProfile[];
}

async function resolveFireflyProfiles(profiles: FireflyProfile[]) {
    if (!profiles.length) return [];
    return Promise.all(
        profiles.map((profile) => {
            return getProfileById(narrowToSocialSource(profile.source), profile.identity);
        }),
    );
}

export function DisconnectButton({ profile, relations }: DisconnectButtonProps) {
    const [{ loading }, disconnectWallet] = useAsyncFn(async () => {
        try {
            const relatedProfiles = await resolveFireflyProfiles(relations);
            const confirmed = await waitForDisconnectConfirmation(profile, compact(relatedProfiles));
            if (!confirmed) return;
            await FireflySocialMediaProvider.deleteWallet([profile.identity]);
            enqueueSuccessMessage(t`Disconnected from your social graph`);
        } catch (error) {
            enqueueErrorMessage(
                getSnackbarMessageFromError(error, t`Failed to disconnect wallet from your social graph.`),
                { error },
            );
            throw error;
        }
    }, [profile, relations]);

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
