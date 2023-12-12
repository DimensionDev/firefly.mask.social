'use client';

import { redirect } from 'next/navigation.js';

import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function ProfileHome() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const currentProfile = useCurrentProfile(currentSocialPlatform);

    if (!currentProfile) {
        return <NotLoginFallback platform={currentSocialPlatform} />;
    }

    redirect(
        `/profile/${currentProfile.source === SocialPlatform.Lens ? currentProfile.handle : currentProfile.profileId}`,
    );
}
