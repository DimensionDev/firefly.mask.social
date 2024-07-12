'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Source, type SourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { ProfileTabContext } from '@/hooks/useProfileTabContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface Props {
    identity: string;
    source: SourceInURL;
}

export function ProfileDetailPage({ identity, source }: Props) {
    if (!identity) {
        notFound();
    }

    const profileTab = { source: resolveSourceFromUrl(source), identity };

    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some(
        (x) => x.source === profileTab.source && x.identity === profileTab.identity,
    );

    const { data: othersProfiles = EMPTY_LIST } = useQuery({
        enabled: !isCurrentProfile,
        queryKey: ['all-profiles', profileTab.source, profileTab.identity],
        queryFn: async () => {
            if (profileTab.source !== Source.Wallet || !profileTab.identity) return EMPTY_LIST;
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(profileTab.source, profileTab.identity);
        },
    });

    return (
        <ProfileTabContext.Provider initialState={profileTab}>
            <ProfilePage profiles={isCurrentProfile ? currentProfiles : othersProfiles} />
        </ProfileTabContext.Provider>
    );
}
