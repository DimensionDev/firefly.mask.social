import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage, enqueueMessageFromError, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

/**
 * Report a profile
 */
export function useReportProfile() {
    return useAsyncFn(async (profile: Profile) => {
        try {
            const provider = resolveSocialMediaProvider(profile.source);
            const result = await provider.reportProfile(profile.profileId);
            if (result) enqueueSuccessMessage(t`Report submitted on ${profile.source}`);
            else enqueueErrorMessage(t`Failed to report @${profile.handle}`);
            return result;
        } catch (error) {
            enqueueMessageFromError(error, t`Failed to report @${profile.handle}.`);
            throw error;
        }
    }, []);
}
