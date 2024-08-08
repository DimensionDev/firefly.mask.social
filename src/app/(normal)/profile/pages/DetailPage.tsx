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
import { useProfileIdentityState } from '@/store/useProfileIdentityStore.js';

interface Props {
    identity: string;
    source: SocialSourceInURL;
}

export function ProfileDetailPage({ identity, source }: Props) {
    const resolvedSource = resolveSourceFromUrl(source);
    const profileIdentity = { source: resolvedSource, identity };

    const { setProfileIdentity } = useProfileIdentityState();
    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some(
        (x) => x.source === profileIdentity.source && x.identity === profileIdentity.identity,
    );

    const { data: otherProfiles = EMPTY_LIST, isLoading } = useQuery({
        queryKey: ['all-profiles', profileIdentity.source, profileIdentity.identity],
        queryFn: async () => {
            if (!profileIdentity.identity) return EMPTY_LIST;
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(
                profileIdentity.source,
                profileIdentity.identity,
            );
        },
    });

    const profiles = isCurrentProfile ? currentProfiles : otherProfiles;

    useEffect(() => {
        setProfileIdentity({
            source: resolvedSource,
            id: identity,
        });
    }, [identity, resolvedSource, isCurrentProfile, setProfileIdentity]);

    if (isLoading && !isCurrentProfile) {
        return <Loading />;
    }

    if (!identity) {
        notFound();
    }

    return <ProfilePage profiles={profiles} />;
}
