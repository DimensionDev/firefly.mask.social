'use client';

import { t } from '@lingui/macro';
import { useMemo } from 'react';
import { useDocumentTitle } from 'usehooks-ts';

import { ContentTabs } from '@/components/Profile/ContentTabs.js';
import { Info } from '@/components/Profile/Info.js';
import { Title } from '@/components/Profile/Title.js';
import { SocialPlatform } from '@/constants/enum.js';
import { SITE_NAME } from '@/constants/index.js';
import { createPageTitle } from '@/helpers/createPageTitle.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { useIsMyProfile } from '@/hooks/useIsMyProfile.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface ProfilePageProps {
    channel: Profile;
}

export function ProfilePage({ channel }: ProfilePageProps) {
    const currentProfileId = channel.source === SocialPlatform.Lens ? channel.handle : channel.profileId;
    const isMyProfile = useIsMyProfile(channel.source, currentProfileId);

    const title = useMemo(() => {
        if (!channel) return SITE_NAME;
        const fragments = [channel.displayName];
        if (channel.handle) fragments.push(`(@${channel.handle})`);
        return createPageTitle(fragments.join(' '));
    }, [channel]);

    useDocumentTitle(title);
    useNavigatorTitle(t`Profile`);
    useUpdateCurrentVisitingProfile(channel);

    return (
        <div>
            {!isMyProfile ? <Title profile={channel} /> : null}

            <Info profile={channel} isMyProfile={isMyProfile} source={channel.source} />

            <ContentTabs source={channel.source} profileId={channel.profileId} />
        </div>
    );
}
