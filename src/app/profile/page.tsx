'use client';

import { redirect } from 'next/navigation.js';

import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { useLogin } from '@/hooks/useLogin.js';
import { usePlatformAccount } from '@/hooks/usePlatformAccount.js';
import { useGlobalState } from '@/store/useGlobalStore.js';

export default function ProfileHome() {
    const currentSocialPlatform = useGlobalState.use.currentSocialPlatform();
    const isLogin = useLogin(currentSocialPlatform);
    const platformAccount = usePlatformAccount();
    if (!isLogin || !platformAccount.lens.handle) {
        return <NotLoginFallback platform={currentSocialPlatform} />;
    }
    redirect(`/profile/${platformAccount.lens.handle}`);
}
