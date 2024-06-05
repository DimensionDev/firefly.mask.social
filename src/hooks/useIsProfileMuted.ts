import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/configs/queryClient.js';
import { FireflyPlatform, Source } from '@/constants/enum.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useIsProfileMuted(profile: Profile, enabled = true) {
    const isFarcaster = profile?.source === Source.Farcaster;
    const isLogin = useIsLogin(Source.Farcaster);
    const { data } = useQuery({
        enabled: isFarcaster && isLogin && enabled,
        queryKey: ['profile-is-muted', profile.profileId],
        queryFn: () => {
            return FireflySocialMediaProvider.isProfileMuted(FireflyPlatform.Farcaster, profile.profileId);
        },
    });
    return isFarcaster ? data : !!profile?.viewerContext?.blocking;
}

export function isProfileMuted(profile: Profile) {
    const blocked = queryClient.getQueryData<boolean>(['profile-is-muted', profile.source, profile.profileId]);
    return blocked || profile.viewerContext?.blocking;
}
