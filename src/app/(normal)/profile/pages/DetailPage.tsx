'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import { type SocialSourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { ProfileTabContext } from '@/hooks/useProfileTabContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface Props {
    identity: string;
    source: SocialSourceInURL;
}

export function ProfileDetailPage({ identity, source }: Props) {
    const profileTab = { source: resolveSourceFromUrl(source), identity };

    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some(
        (x) => x.source === profileTab.source && x.identity === profileTab.identity,
    );

    const { data: othersProfiles = EMPTY_LIST, isLoading } = useQuery({
        enabled: !isCurrentProfile,
        queryKey: ['all-profiles', profileTab.source, profileTab.identity],
        queryFn: async () => {
            if (!profileTab.identity) return EMPTY_LIST;
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(profileTab.source, profileTab.identity);
        },
    });

    if (isLoading && !isCurrentProfile) {
        return <Loading />;
    }

    if (!identity) {
        notFound();
    }

    return (
        <ProfileTabContext.Provider initialState={profileTab}>
            <ProfilePage profiles={isCurrentProfile ? currentProfiles : othersProfiles} />
        </ProfileTabContext.Provider>
    );
}
