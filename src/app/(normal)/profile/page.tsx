'use client';

import { ProfilePage } from '@/app/(normal)/profile/pages/Profile.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function Page() {
    const currentSource = useGlobalState.use.currentSource();
    const currentProfile = useCurrentProfile(currentSource);

    useUpdateCurrentVisitingProfile(currentProfile);

    if (!currentProfile) {
        return <NotLoginFallback source={currentSource} />;
    }

    return <ProfilePage profile={currentProfile} />;
}
