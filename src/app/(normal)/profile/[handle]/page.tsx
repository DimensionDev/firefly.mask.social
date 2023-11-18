'use client';

import ContentTabs from '@/app/(normal)/profile/components/ContentTabs.js';
import Info from '@/app/(normal)/profile/components/Info.js';
import PlatformTabs from '@/app/(normal)/profile/components/PlatformTabs.js';
import Title from '@/app/(normal)/profile/components/Title.js';
import { PlatformEnum } from '@/app/(normal)/profile/type.js';
import { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import { useEffect, useMemo, useState } from 'react';
import type { Profile } from '@/providers/types/SocialMedia.js';

const lensClient = new LensSocialMedia();

interface ProfileProps {
    params: { handle: string };
}
export default function Profile({ params: { handle } }: ProfileProps) {
    const [profile, setProfile] = useState<Profile>();
    const [tab, setTab] = useState<PlatformEnum>(PlatformEnum.Lens);

    const isLogin = useMemo(() => false, []);

    const isMyProfile = useMemo(() => isLogin && false, [isLogin]);

    useEffect(() => {
        (async () => {
            const profile = await lensClient.getProfileById(`test/${handle}`);
            console.log(profile);
            setProfile(profile);
        })();
    }, [handle]);

    return (
        <div>
            {isMyProfile ? <PlatformTabs tab={tab} setTab={setTab} /> : null}

            {!isMyProfile ? <Title profile={profile} /> : null}

            <Info platform={tab} handle={handle} profile={profile} />

            <ContentTabs />
        </div>
    );
}
