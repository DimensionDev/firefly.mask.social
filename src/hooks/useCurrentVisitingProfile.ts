import { useEffect } from 'react';

import { ValueRef } from '@/libs/ValueRef.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

const currentVisitingProfile = new ValueRef<Profile | null>(null);

export function useUpdateCurrentVisitingProfile(profile: Profile | null) {
    useEffect(() => {
        currentVisitingProfile.value = profile;
    }, [profile]);
}
