import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { useIsFollowTwitterInActivity } from '@/components/Activity/hooks/useIsFollowTwitterInActivity.js';
import { Source } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useActivityFollowTwitter(profileId: string, handle: string) {
    const { refetch } = useIsFollowTwitterInActivity(profileId, handle);
    return useAsyncFn(async () => {
        try {
            if (fireflyBridgeProvider.supported) {
                await fireflyBridgeProvider.request(SupportedMethod.FOLLOW_TWITTER_USER, {
                    id: profileId,
                });
            } else {
                await TwitterSocialMediaProvider.follow(profileId);
            }
            await refetch();
            enqueueSuccessMessage(t`Followed @${handle} on ${Source.Twitter}`);
        } catch (error) {
            enqueueErrorMessage(
                getSnackbarMessageFromError(error, t`Failed to follow @${handle} on ${Source.Twitter}.`),
                {
                    error,
                },
            );
            throw error;
        }
    }, [profileId, handle]);
}
