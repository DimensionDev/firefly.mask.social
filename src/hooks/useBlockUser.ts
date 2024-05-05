import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

/**
 * Block a user
 */
export function useBlockUser() {
    return useAsyncFn(async (profile: Profile) => {
        try {
            const provider = resolveSocialMediaProvider(profile.source);
            const result = await provider.blockUser(profile.profileId);
            return result;
        } catch (error) {
            enqueueErrorMessage(t`Failed to block @${profile.handle}`, { error });
            throw error;
        }
    }, []);
}
