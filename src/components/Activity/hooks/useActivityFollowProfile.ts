import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { useActivityCurrentAccountProfileId } from '@/components/Activity/hooks/useActivityCurrentAccountHandle.js';
import { useIsFollowInActivity } from '@/components/Activity/hooks/useIsFollowInActivity.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getSnackbarMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export function useActivityFollowProfile(source: SocialSource, profileId: string, handle: string) {
    const { refetch } = useIsFollowInActivity(source, profileId, handle);
    const farcasterProfileId = useActivityCurrentAccountProfileId(Source.Farcaster);
    const { data: authToken } = useFireflyBridgeAuthorization();
    return useAsyncFn(async () => {
        try {
            await FireflyActivityProvider.follow(source, profileId, {
                sourceFarcasterProfileId:
                    typeof farcasterProfileId === 'string' ? parseInt(farcasterProfileId, 10) : farcasterProfileId,
                authToken,
            });
            await refetch();
            enqueueSuccessMessage(t`Followed @${handle} on ${resolveSourceName(source)}.`);
        } catch (error) {
            enqueueErrorMessage(
                getSnackbarMessageFromError(error, t`Failed to follow @${handle} on ${resolveSourceName(source)}.`),
                {
                    error,
                },
            );
            throw error;
        }
    }, [profileId, handle, source, farcasterProfileId, authToken]);
}
