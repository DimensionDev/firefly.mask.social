import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { createSessionForProfileId } from '@/providers/lens/createSessionForProfileId.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useLensStateStore } from '@/store/useProfileStore.js';

export function useSwitchLensAccount() {
    const updateCurrentProfile = useLensStateStore.use.updateCurrentProfile();
    const [{ loading }, login] = useAsyncFn(
        async (profile: Profile) => {
            try {
                const session = await createSessionForProfileId(profile.profileId);
                updateCurrentProfile(profile, session);
                enqueueSuccessMessage(t`Your Lens account is now connected`);
            } catch (error) {
                enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to login`), {
                    error,
                });
                throw error;
            }
        },
        [updateCurrentProfile],
    );
    return { loading, login };
}
