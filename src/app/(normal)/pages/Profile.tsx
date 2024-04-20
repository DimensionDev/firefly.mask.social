'use client';

import { t } from '@lingui/macro';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { Info } from '@/components/Profile/Info.js';
import { Tabs } from '@/components/Profile/Tabs.js';
import { Title } from '@/components/Profile/Title.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfilePageProps {
    profile: Profile;
}

export function ProfilePage({ profile }: ProfilePageProps) {
    const currentProfileId = profile.source === SocialPlatform.Lens ? profile.handle : profile.profileId;
    const isMyProfile = useIsMyProfile(profile.source, currentProfileId);

    const title = useMemo(() => {
        if (!profile) return SITE_NAME;
        const fragments = [profile.displayName];
        if (profile.handle) fragments.push(`(@${profile.handle})`);
        return createPageTitle(fragments.join(' '));
    }, [profile]);

    useDocumentTitle(title);
    useNavigatorTitle(t`Profile`);
    useUpdateCurrentVisitingProfile(profile);

    return (
        <div>
            {!isMyProfile ? <Title profile={profile} /> : null}

            <Info profile={profile} isMyProfile={isMyProfile} source={profile.source} />

            <Tabs source={profile.source} profileId={profile.profileId} />
        </div>
    );
}
