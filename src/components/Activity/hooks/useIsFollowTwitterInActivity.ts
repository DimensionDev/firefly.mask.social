import { useQuery } from '@tanstack/react-query';

import { useIsLoginTwitterInActivity } from '@/components/Activity/hooks/useIsLoginTwitterInActivity.js';
import { Source } from '@/constants/enum.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { getProfileById } from '@/services/getProfileById.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useIsFollowTwitterInActivity(profileId: string, handle: string) {
    const { data: isLoggedIn = false } = useIsLoginTwitterInActivity();
    return useQuery({
        enabled: isLoggedIn,
        queryKey: ['is-follow-twitter-activity', profileId, handle],
        queryFn: async () => {
            if (fireflyBridgeProvider.supported) {
                return (
                    (await fireflyBridgeProvider.request(SupportedMethod.IS_TWITTER_USER_FOLLOWING, {
                        id: profileId,
                    })) === 'true'
                );
            }
            const profile = await getProfileById(Source.Twitter, profileId);
            return profile?.viewerContext?.following ?? false;
        },
    });
}