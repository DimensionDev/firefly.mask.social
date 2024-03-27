import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
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
                enqueueSuccessMessage(t`Your Lens account is now connected`);
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`));
            }
        },
        [updateCurrentProfile],
    );
    return { loading, login };
}
