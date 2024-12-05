import { t } from '@lingui/macro';
import { useIsMutating, useMutation } from '@tanstack/react-query';

import { checkFarcasterInvalidSignerKey } from '@/helpers/checkFarcasterInvalidSignerKey.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getErrorMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { LoginModalRef } from '@/modals/controls.js';
import { captureProfileActionEvent } from '@/providers/telemetry/captureProfileActionEvent.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useToggleFollow(profile: Profile) {
    const { source } = profile;
    const isLogin = useIsLogin(source);
    const mutationKey = ['toggle-follow', source, profile.profileId];
    const isMutating = useIsMutating({ mutationKey, exact: true }) > 0;

    const mutation = useMutation({
        mutationKey,
        mutationFn: async () => {
            if (!profile.profileId) return;

            if (!isLogin) {
                LoginModalRef.open({ source });
                return;
            }

            const following = !!profile.viewerContext?.following;
            const sourceName = resolveSourceName(profile.source);

            try {
                const provider = resolveSocialMediaProvider(source);
                const result = following
                    ? await provider.unfollow(profile.profileId)
                    : await provider.follow(profile.profileId);
                enqueueSuccessMessage(
                    following
                        ? t`Unfollowed @${profile.handle} on ${sourceName}`
                        : t`Followed @${profile.handle} on ${sourceName}`,
                );
                captureProfileActionEvent(following ? 'unfollow' : 'follow', profile);
                return result;
            } catch (error) {
                enqueueErrorMessage(
                    getErrorMessageFromError(
                        error,
                        following
                            ? t`Failed to unfollow @${profile.handle} on ${sourceName}.`
                            : t`Failed to follow @${profile.handle} on ${sourceName}.`,
                    ),
                    { error },
                );

                checkFarcasterInvalidSignerKey(error);

                throw error;
            }
        },
    });
    return [isMutating, mutation] as const;
}
