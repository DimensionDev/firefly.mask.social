'use client';

import { useQuery } from '@tanstack/react-query';

import { queryClient } from '@/configs/queryClient.js';
import type { Source } from '@/constants/enum.js';
import { resolveFireflyPlatform } from '@/helpers/resolveFireflyPlatform.js';
import { useIsLogin } from '@/hooks/useIsLogin.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function useIsProfileMuted(source: Source, profileId: string, blocking?: boolean, enabled = true) {
    const isLogin = useIsLogin();
    const { data } = useQuery({
        enabled: !!source && !!profileId && isLogin && enabled,
        queryKey: ['profile-is-muted', source, profileId],
        staleTime: 600_000,
        queryFn: () => {
            const platform = resolveFireflyPlatform(source);
            if (!platform) return false;
            return FireflyEndpointProvider.isProfileMuted(platform, profileId);
        },
    });
    return data ?? !!blocking;
}

export function isProfileMuted(profile: Profile) {
    const blocked = queryClient.getQueryData<boolean>(['profile-is-muted', profile.source, profile.profileId]);
    return blocked ?? profile.viewerContext?.blocking;
}
