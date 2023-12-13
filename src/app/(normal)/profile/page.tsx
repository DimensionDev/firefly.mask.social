'use client';

import { redirect } from 'next/navigation.js';

import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { getProfileUrl } from '@/helpers/getProfileUrl.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function ProfileHome() {
    const currentSource = useGlobalState.use.currentSource();
    const currentProfile = useCurrentProfile(currentSource);

    if (!currentProfile) {
        return <NotLoginFallback source={currentSource} />;
    }

    redirect(getProfileUrl(currentProfile));
}
