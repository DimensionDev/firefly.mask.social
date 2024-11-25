import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { useIsFollowInActivity } from '@/components/Activity/hooks/useIsFollowInActivity.js';
import type { SocialSource } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useActivityFollowProfile(source: SocialSource, profileId: string, handle: string) {
    const { refetch } = useIsFollowInActivity(source, profileId, handle);
    return useAsyncFn(async () => {
        try {
            if (fireflyBridgeProvider.supported) {
                // TODO: farcaster follow
                await fireflyBridgeProvider.request(SupportedMethod.FOLLOW_TWITTER_USER, {
                    id: profileId,
                });
            } else {
                await resolveSocialMediaProvider(source)?.follow(profileId);
            }
            await refetch();
            enqueueSuccessMessage(t`Followed @${handle} on X.`);
        } catch (error) {
            enqueueErrorMessage(getSnackbarMessageFromError(error, t`Failed to follow @${handle} on X.`), {
                error,
            });
            throw error;
        }
    }, [profileId, handle, source]);
}
