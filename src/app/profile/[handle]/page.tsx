'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import ContentTabs from '@/app/profile/components/ContentTabs.js';
import Info from '@/app/profile/components/Info.js';
import PlatformTabs from '@/app/profile/components/PlatformTabs.js';
import Title from '@/app/profile/components/Title.js';
import { PlatformEnum } from '@/app/profile/type.js';
import { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

const lensClient = new LensSocialMedia();

interface ProfileProps {
    params: { handle: string };
}
export default function Profile({ params: { handle } }: ProfileProps) {
    const [tab, setTab] = useState<PlatformEnum>(PlatformEnum.Lens);

    const { data: profile } = useQuery({
        queryKey: ['profile', handle],
        queryFn: () => lensClient.getProfileById(`test/${handle}`),
    });

    const isLogin = useMemo(() => false, []);

    const isMyProfile = useMemo(() => isLogin && false, [isLogin]);

    return (
        <div>
            {isMyProfile ? <PlatformTabs tab={tab} setTab={setTab} /> : null}

            {!isMyProfile ? <Title profile={profile} /> : null}

            <Info platform={tab} handle={handle} profile={profile} />

            <ContentTabs />
        </div>
    );
}
