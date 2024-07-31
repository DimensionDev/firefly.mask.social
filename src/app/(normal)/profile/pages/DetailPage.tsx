'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { useEffect } from 'react';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import { type SocialSourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { useProfileTabState } from '@/store/useProfileTabStore.js';

interface Props {
    identity: string;
    source: SocialSourceInURL;
}

export function ProfileDetailPage({ identity, source }: Props) {
    const resolvedSource = resolveSourceFromUrl(source);
    const profileTab = { source: resolvedSource, identity };

    const { setProfileTab } = useProfileTabState();
    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some(
        (x) => x.source === profileTab.source && x.identity === profileTab.identity,
    );

    const { data: otherProfiles = EMPTY_LIST, isLoading } = useQuery({
        queryKey: ['all-profiles', profileTab.source, profileTab.identity],
        queryFn: async () => {
            if (!profileTab.identity) return EMPTY_LIST;
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(profileTab.source, profileTab.identity);
        },
    });

    const profiles = isCurrentProfile ? currentProfiles : otherProfiles;

    useEffect(() => {
        setProfileTab({
            source: resolvedSource,
            identity,
            isMyProfile: isCurrentProfile,
        });
    }, [identity, resolvedSource, isCurrentProfile, setProfileTab]);

    if (isLoading && !isCurrentProfile) {
        return <Loading />;
    }

    if (!identity) {
        notFound();
    }

    return <ProfilePage profiles={profiles} />;
}
