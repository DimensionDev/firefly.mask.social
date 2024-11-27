import { useQuery } from '@tanstack/react-query';

import { useActivityCurrentAccountProfileId } from '@/components/Activity/hooks/useActivityCurrentAccountHandle.js';
import { useIsLoginInActivity } from '@/components/Activity/hooks/useIsLoginInActivity.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { useFireflyBridgeAuthorization } from '@/hooks/useFireflyBridgeAuthorization.js';
import { FireflyActivityProvider } from '@/providers/firefly/Activity.js';

export function useIsFollowInActivity(source: SocialSource, profileId: string, handle: string) {
    const isLoggedIn = useIsLoginInActivity(source);
    const { data: authToken } = useFireflyBridgeAuthorization();
    const farcasterProfileId = useActivityCurrentAccountProfileId(Source.Farcaster);
    return useQuery({
        enabled: isLoggedIn,
        queryKey: ['is-follow-activity', source, profileId, handle, authToken, farcasterProfileId],
        queryFn: async () => {
            return FireflyActivityProvider.isFollowed(source, profileId, {
                authToken,
                sourceFarcasterProfileId:
                    typeof farcasterProfileId === 'string' ? parseInt(farcasterProfileId, 10) : farcasterProfileId,
            });
        },
    });
}
