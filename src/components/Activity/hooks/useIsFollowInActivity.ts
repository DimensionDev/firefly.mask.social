import { useQuery } from '@tanstack/react-query';

import { useIsLoginInActivity } from '@/components/Activity/hooks/useIsLoginInActivity.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';
import { getProfileById } from '@/services/getProfileById.js';
import { SupportedMethod } from '@/types/bridge.js';

export function useIsFollowInActivity(source: SocialSource, profileId: string, handle: string) {
    const isLoggedIn = useIsLoginInActivity(source);
    return useQuery({
        enabled: isLoggedIn,
        queryKey: ['is-follow-twitter-activity', profileId, handle],
        queryFn: async () => {
            if (fireflyBridgeProvider.supported && source === Source.Twitter) {
                return (
                    (await fireflyBridgeProvider.request(SupportedMethod.IS_TWITTER_USER_FOLLOWING, {
                        id: profileId,
                    })) === 'true'
                );
            }
            const profile = await getProfileById(source, profileId);
            return profile?.viewerContext?.following ?? false;
        },
    });
}
