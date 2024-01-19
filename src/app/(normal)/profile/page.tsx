'use client';

import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import ProfilePage from '@/app/(normal)/profile/[source]/[id]/page.js';
import { SocialPlatform } from '@/constants/enum.js';

export default function ProfileHome() {
    const currentSource = useGlobalState.use.currentSource();
    const currentProfile = useCurrentProfile(currentSource);

    if (!currentProfile) {
        return <NotLoginFallback source={currentSource} />;
    }

    return <ProfilePage params={{ id: currentSource === SocialPlatform.Lens ? currentProfile.handle : currentProfile.profileId, currentSource }} />

}
