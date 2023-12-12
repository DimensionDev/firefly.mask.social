'use client';

import { redirect } from 'next/navigation.js';

import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function ProfileHome() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const currentProfile = useCurrentProfile(currentSocialPlatform);

    if (!currentProfile) {
        return <NotLoginFallback platform={currentSocialPlatform} />;
    }

    redirect(getProfileUrl(currentProfile));
}
