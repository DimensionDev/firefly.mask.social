import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { getIsMuted } from '@/hooks/useIsMuted.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useBlockedUsersState } from '@/store/useBlockedUsersStore.js';

/**
 * Block/Unblock a user
 */
export function useToggleBlock(operator: Profile | null) {
    const { blockUser } = useBlockedUsersState();
    const isLogin = useIsLogin(operator?.source);
    return useAsyncFn(
        async (profile: Profile, blocked?: boolean) => {
            if (!isLogin) {
                LoginModalRef.open({ source: profile.source });
                return false;
            }
            const blocking = blocked ?? getIsMuted(profile);
            const sourceName = resolveSourceName(profile.source);
            try {
                const provider = resolveSocialMediaProvider(profile.source);
                if (blocking) {
                    const result = await provider.unblockUser(profile.profileId);
                    enqueueSuccessMessage(t`Unmuted @${profile.handle} on ${sourceName}`);
                    return result;
                } else {
                    const result = await provider.blockUser(profile.profileId);
                    if (result && operator) blockUser(operator, profile);
                    enqueueSuccessMessage(t`Muted @${profile.handle} on ${sourceName}`);
                    return result;
                }
            } catch (error) {
                enqueueErrorMessage(
                    blocking
                        ? t`Failed to unmute @${profile.handle} on ${sourceName}`
                        : t`Failed to mute @${profile.handle} on ${sourceName}`,
                    { error },
                );
                throw error;
            }
        },
        [isLogin, operator, blockUser],
    );
}
