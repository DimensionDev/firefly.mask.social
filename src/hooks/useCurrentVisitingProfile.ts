import { ValueRef } from '@masknet/shared-base';
import { useValueRef } from '@masknet/shared-base-ui';
import { usePathname } from 'next/navigation.js';
import { useEffect } from 'react';

import { PageRoute } from '@/constants/enum.js';
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
    const isProfilePage = isRoutePathname(pathname, PageRoute.Profile);
    const profile = useValueRef(currentVisitingProfile);
    return isProfilePage ? profile : null;
}
