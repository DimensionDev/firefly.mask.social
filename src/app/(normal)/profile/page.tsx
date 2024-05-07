'use client';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Page() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);

    const currentProfile = useCurrentProfile(currentSocialSource);

    useUpdateCurrentVisitingProfile(currentProfile);

    if (!currentProfile) {
        return <NotLoginFallback source={currentSocialSource} />;
    }

    return <ProfilePage profile={currentProfile} />;
}
