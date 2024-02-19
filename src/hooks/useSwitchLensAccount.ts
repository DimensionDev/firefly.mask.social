import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useLensStateStore } from '@/store/useProfileStore.js';

export function useSwitchLensAccount() {
    const updateCurrentProfile = useLensStateStore.use.updateCurrentProfile();
    const enqueueSnackbar = useCustomSnackbar();
    const [{ loading }, login] = useAsyncFn(
        async (profile: Profile) => {
            try {
                const session = await LensSocialMediaProvider.createSessionForProfileId(profile.profileId);
                updateCurrentProfile(profile, session);
                enqueueSnackbar(t`Your Lens account is now connected`, { variant: 'success' });
            } catch (error) {
                enqueueSnackbar(getSnackbarMessageFromError(error, t`Failed to login`), { variant: 'error' });
            }
        },
        [enqueueSnackbar, updateCurrentProfile],
    );
    return { loading, login };
}
