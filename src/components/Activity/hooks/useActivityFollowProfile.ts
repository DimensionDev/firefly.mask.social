import { t } from '@lingui/macro';
import { useAsyncFn } from 'react-use';

import { useActivityCurrentAccountProfileId } from '@/components/Activity/hooks/useActivityCurrentAccountHandle.js';
import { useIsFollowInActivity } from '@/components/Activity/hooks/useIsFollowInActivity.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { enqueueErrorMessage, enqueueSuccessMessage } from '@/helpers/enqueueMessage.js';
import { getErrorMessageFromError } from '@/helpers/getSnackbarMessageFromError.js';
import { resolveSourceName } from '@/helpers/resolveSourceName.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export function useActivityFollowProfile(source: SocialSource, profileId: string, handle: string) {
    const { refetch } = useIsFollowInActivity(source, profileId, handle);
    const farcasterProfileId = useActivityCurrentAccountProfileId(Source.Farcaster);
    return useAsyncFn(async () => {
        try {
            await FireflyActivityProvider.follow(source, profileId, {
                sourceFarcasterProfileId: farcasterProfileId ? Number.parseInt(farcasterProfileId, 10) : undefined,
            });
            await refetch();
            enqueueSuccessMessage(t`Followed @${handle} on ${resolveSourceName(source)}.`);
        } catch (error) {
            enqueueErrorMessage(
                getErrorMessageFromError(error, t`Failed to follow @${handle} on ${resolveSourceName(source)}.`),
                {
                    error,
                },
            );
            throw error;
        }
    }, [profileId, handle, source, farcasterProfileId]);
}
