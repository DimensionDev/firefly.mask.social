import { t } from '@lingui/macro';

import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { LoginModalRef, SnackbarRef } from '@/modals/controls.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';

export async function login(createSession: () => Promise<FarcasterSession>) {
    try {
        const session = await createSession();
        const profile = await FarcasterSocialMediaProvider.getProfileById(session.profileId);

        useFarcasterStateStore.getState().updateProfiles([profile]);
        useFarcasterStateStore.getState().updateCurrentProfile(profile, session);

        SnackbarRef.open({
            message: t`Your Farcaster account is now connected.`,
            options: {
                variant: 'success',
            },
        });
        LoginModalRef.close();
    } catch (error) {
        if (error instanceof Error && error.message === 'Aborted') return;
        SnackbarRef.open({
            message: getSnackbarMessageFromError(error, t`Failed to login`),
            options: {
                variant: 'error',
            },
        });
        // if any error occurs, close the modal
        // since we don't need to do error handling in UI part.
        LoginModalRef.close();
    }
}
