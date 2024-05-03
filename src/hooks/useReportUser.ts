import { useAsyncFn } from 'react-use';

import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

/**
 * Report a user
 */
export function useReportUser() {
    return useAsyncFn(async (profile: Profile) => {
        const provider = resolveSocialMediaProvider(profile.source);
        const result = await provider.reportUser(profile.profileId);
        return result;
    }, []);
}
