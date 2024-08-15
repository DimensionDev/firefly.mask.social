import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/configs/queryClient.js';
import { Source } from '@/constants/enum.js';
import { resolveSourceInURL } from '@/helpers/resolveSourceInURL.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useIsProfileMuted(profile: Profile, enabled = true) {
    const isLogin = useIsLogin();
    const profileId = profile?.source === Source.Farcaster ? +profile.profileId : profile.profileId;
    const { data } = useQuery({
        enabled: !!profile && isLogin && enabled,
        queryKey: ['profile-is-muted', profile.source, profileId],
        staleTime: 600_000,
        queryFn: () => {
            return FireflySocialMediaProvider.isProfileMuted(resolveSourceInURL(profile.source), profile.profileId);
        },
    });
    return data ?? !!profile.viewerContext?.blocking;
}

export function isProfileMuted(profile: Profile) {
    const blocked = queryClient.getQueryData<boolean>(['profile-is-muted', profile.source, profile.profileId]);
    return blocked ?? profile.viewerContext?.blocking;
}
