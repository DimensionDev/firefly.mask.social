import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.jsx';
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
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to report @${profile.handle}`), { error });
            throw error;
        }
    }, []);
}
