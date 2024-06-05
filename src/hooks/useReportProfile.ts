import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useBlockedProfilesState } from '@/store/useBlockedProfilesStore.js';

/**
 * Report a profile
 */
export function useReportProfile(operator: Profile | null) {
    const { blockProfile } = useBlockedProfilesState();
    return useAsyncFn(
        async (profile: Profile) => {
            try {
                const provider = resolveSocialMediaProvider(profile.source);
                const result = await provider.reportProfile(profile.profileId);
                if (result && operator) blockProfile(operator, profile);
                return result;
            } catch (error) {
                enqueueErrorMessage(t`Failed to report @${profile.handle}`, { error });
                throw error;
            }
        },
        [blockProfile, operator],
    );
}
