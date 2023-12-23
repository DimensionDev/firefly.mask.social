import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function useSwitchLensAccount() {
    const updateCurrentProfile = useLensStateStore.use.updateCurrentProfile();
    const enqueueSnackbar = useCustomSnackbar();
    const [{ loading }, login] = useAsyncFn(async (profile: Profile) => {
        const session = await LensSocialMediaProvider.createSessionForProfileId(profile.profileId);
        updateCurrentProfile(profile, session);
        enqueueSnackbar(t`Your Lens account is now connected`, { variant: 'success' });
    });
    return { loading, login };
}
