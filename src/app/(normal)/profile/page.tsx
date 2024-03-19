'use client';

import ProfilePage from '@/app/(normal)/profile/[source]/[id]/page.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SocialPlatform, SourceInURL } from '@/constants/enum.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function ProfileHome() {
    const currentSource = useGlobalState.use.currentSource();
    const currentProfile = useCurrentProfile(currentSource);

    useUpdateCurrentVisitingProfile(currentProfile);

    if (!currentProfile) {
        return <NotLoginFallback source={currentSource} />;
    }

    return (
        <ProfilePage
            params={{
                id: currentSource === SocialPlatform.Lens ? currentProfile.handle : currentProfile.profileId,
                source: currentSource === SocialPlatform.Lens ? SourceInURL.Lens : SourceInURL.Farcaster,
            }}
        />
    );
}
