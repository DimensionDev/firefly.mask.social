import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { usePostState } from '@/store/usePostStore.js';

/**
 * Block a user
 */
export function useBlockUser(operator: Profile | null) {
    const { blockUser } = usePostState();
    return useAsyncFn(
        async (profile: Profile) => {
            try {
                const provider = resolveSocialMediaProvider(profile.source);
                const result = await provider.blockUser(profile.profileId);
                if (result && operator) blockUser(operator, profile);

                return result;
            } catch (error) {
                enqueueErrorMessage(t`Failed to block @${profile.handle}`, { error });
                throw error;
            }
        },
        [operator, blockUser],
    );
}
