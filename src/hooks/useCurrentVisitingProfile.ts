import { ValueRef } from '@masknet/shared-base';
import { usePathname } from 'next/navigation.js';
import { useEffect, useMemo } from 'react';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

const currentVisitingProfile = new ValueRef<Profile | null>(null);

export function useUpdateCurrentVisitingProfile(profile: Profile | null) {
    useEffect(() => {
        currentVisitingProfile.value = profile;
    }, [profile]);
}

export function useCurrentVisitingProfile() {
    const pathname = usePathname();

    return useMemo(() => {
        const isProfilePage = isRoutePathname(pathname, '/profile');
        if (!isProfilePage) return null;
        return currentVisitingProfile.value;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname, currentVisitingProfile.value]);
}
