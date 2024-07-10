import { usePathname } from 'next/navigation.js';
import { useEffect } from 'react';

import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { useValueRef } from '@/hooks/useValueRef.js';
import { ValueRef } from '@/libs/ValueRef.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

const currentVisitingProfile = new ValueRef<Profile | null>(null);

export function useUpdateCurrentVisitingProfile(profile: Profile | null) {
    useEffect(() => {
        currentVisitingProfile.value = profile;
    }, [profile]);
}

export function useCurrentVisitingProfile() {
    const pathname = usePathname();
    const isProfilePage = isRoutePathname(pathname, '/profile');
    const profile = useValueRef(currentVisitingProfile);
    return isProfilePage ? profile : null;
}
