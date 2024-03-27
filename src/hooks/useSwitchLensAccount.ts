import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { SnackbarRef } from '@/modals/controls.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useLensStateStore } from '@/store/useProfileStore.js';

export function useSwitchLensAccount() {
    const updateCurrentProfile = useLensStateStore.use.updateCurrentProfile();
    const [{ loading }, login] = useAsyncFn(
        async (profile: Profile) => {
            try {
                const session = await LensSocialMediaProvider.createSessionForProfileId(profile.profileId);
                updateCurrentProfile(profile, session);
                SnackbarRef.open({
                    message: t`Your Lens account is now connected`,
                    options: { variant: 'success' },
                });
            } catch (error) {
                SnackbarRef.open({
                    message: getSnackbarMessageFromError(error, t`Failed to login`),
                    options: { variant: 'error' },
                });
            }
        },
        [updateCurrentProfile],
    );
    return { loading, login };
}
