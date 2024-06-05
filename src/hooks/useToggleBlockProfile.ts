import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { getIsProfileMuted } from '@/hooks/useIsProfileMuted.js';
import { LoginModalRef } from '@/modals/controls.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

/**
 * Block/Unblock a profile
 */
export function useToggleBlockProfile(operator: Profile | null) {
    const isLogin = useIsLogin(operator?.source);
    return useAsyncFn(
        async (profile: Profile, overrideMuted?: boolean) => {
            if (!isLogin) {
                LoginModalRef.open({ source: profile.source });
                return false;
            }
            const muted = overrideMuted ?? getIsProfileMuted(profile);
            const sourceName = resolveSourceName(profile.source);
            try {
                const provider = resolveSocialMediaProvider(profile.source);
                if (muted) {
                    const result = await provider.unblockProfile(profile.profileId);
                    enqueueSuccessMessage(t`Unmuted @${profile.handle} on ${sourceName}`);
                    return result;
                } else {
                    const result = await provider.blockProfile(profile.profileId);
                    enqueueSuccessMessage(t`Muted @${profile.handle} on ${sourceName}`);
                    return result;
                }
            } catch (error) {
                enqueueErrorMessage(
                    muted
                        ? t`Failed to unmute @${profile.handle} on ${sourceName}`
                        : t`Failed to mute @${profile.handle} on ${sourceName}`,
                    { error },
                );
                throw error;
            }
        },
        [isLogin, operator],
    );
}
