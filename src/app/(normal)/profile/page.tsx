'use client';

import { redirect } from 'next/navigation.js';

import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { useLogin } from '@/hooks/useLogin.js';
import { usePlatformProfile } from '@/hooks/usePlatformProfile.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function ProfileHome() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const isLogin = useLogin(currentSocialPlatform);
    const platformProfile = usePlatformProfile();
    if (!isLogin || !platformProfile.lens?.handle) {
        return <NotLoginFallback platform={currentSocialPlatform} />;
    }
    redirect(`/profile/${platformProfile.lens.handle}`);
}
