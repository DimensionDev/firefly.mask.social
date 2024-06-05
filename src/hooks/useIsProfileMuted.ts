import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/configs/queryClient.js';
import { FireflyPlatform, Source } from '@/constants/enum.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useIsProfileMuted(profile: Profile | undefined, enabled = true) {
    const isFarcaster = profile?.source === Source.Farcaster;
    const profileId = profile?.profileId;
    const isLogin = useIsLogin(Source.Farcaster);
    const { data } = useQuery({
        enabled: isFarcaster && isLogin && enabled,
        queryKey: ['profile-is-muted', profileId],
        queryFn: () => {
            if (!profileId) return false;
            return FireflySocialMediaProvider.getIsMuted(FireflyPlatform.Farcaster, profileId);
        },
    });
    return isFarcaster ? data : !!profile?.viewerContext?.blocking;
}

export function getIsProfileMuted(profile: Profile) {
    const blocked = queryClient.getQueryData<boolean>(['profile-is-muted', profile.source, profile.profileId]);
    return blocked || profile.viewerContext?.blocking;
}
