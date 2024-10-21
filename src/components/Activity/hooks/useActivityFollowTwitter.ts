import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { useActivityClaimCondition } from '@/components/Activity/hooks/useActivityClaimCondition.js';
import { Source } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { TwitterSocialMediaProvider } from '@/providers/twitter/SocialMedia.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useActivityFollowTwitter() {
    const { refetch } = useActivityClaimCondition();
    return useAsyncFn(async (profileId: string, handle: string) => {
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
    });
}
