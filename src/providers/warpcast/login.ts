import { t } from '@lingui/macro';

import { farcasterClient } from '@/configs/farcasterClient.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';

export async function login(createSession: () => Promise<FarcasterSession>) {
    try {
        const session = await createSession();
        const profile = await FarcasterSocialMediaProvider.getProfileById(session.profileId);

        useFarcasterStateStore.getState().updateProfiles([profile]);
        useFarcasterStateStore.getState().updateCurrentProfile(profile, session);
        farcasterClient.resumeSession(session);

        enqueueSuccessMessage(t`Your Farcaster account is now connected.`);
        LoginModalRef.close();
    } catch (error) {
        if (error instanceof Error && error.message === 'Aborted') return;
        enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`));
        // if any error occurs, close the modal
        // by this we don't need to do error handling in UI part.
        LoginModalRef.close();
    }
}
