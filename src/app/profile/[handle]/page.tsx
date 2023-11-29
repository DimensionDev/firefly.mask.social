'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import ContentTabs from '@/app/profile/components/ContentTabs.js';
import Info from '@/app/profile/components/Info.js';
// import PlatformTabs from '@/app/profile/components/PlatformTabs.js';
import Title from '@/app/profile/components/Title.js';
import { SocialPlatform } from '@/constants/enum.js';
import { useLogin } from '@/hooks/useLogin.js';
import { usePlatformAccount } from '@/hooks/usePlatformAccount.js';
import { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

const lensClient = new LensSocialMedia();

interface ProfileProps {
    params: { handle: string };
}
export default function Profile({ params: { handle } }: ProfileProps) {
    const [tab, setTab] = useState<SocialPlatform>(SocialPlatform.Lens);

    const { data: profile } = useQuery({
        queryKey: ['profile', handle],
        queryFn: () => lensClient.getProfileByHandle(`lens/${handle}`),
    });

    const isLogin = useLogin();

    const platformAccount = usePlatformAccount();

    const isMyProfile = useMemo(
        () => !!isLogin && platformAccount.lens?.handle === handle,
        [handle, isLogin, platformAccount.lens?.handle],
    );

    return (
        <div>
            {/* {isMyProfile ? <PlatformTabs tab={tab} setTab={setTab} /> : null} */}

            {!isMyProfile ? <Title profile={profile} isMyProfile={isMyProfile} /> : null}

            <Info platform={tab} handle={handle} profile={profile} isMyProfile={isMyProfile} />

            <ContentTabs />
        </div>
    );
}
