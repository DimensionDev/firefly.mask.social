'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';
import { useEffect } from 'react';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfiles.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { useProfileIdentityState } from '@/store/useProfileIdentityStore.js';
import { isSameFireflyIdentity } from '@/helpers/isSameFireflyIdentity.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';

interface Props {
    identity: FireflyIdentity;
}

export function ProfileDetailPage({ identity }: Props) {
    const { setProfileIdentity } = useProfileIdentityState();
    const currentProfiles = useCurrentFireflyProfilesAll();
    const isCurrentProfile = currentProfiles.some((x) => isSameFireflyIdentity(x.identity, identity));

    const { data: otherProfiles = EMPTY_LIST, isLoading } = useQuery({
        queryKey: ['all-profiles', identity.source, identity.id],
        queryFn: async () => {
            if (!identity.id) return EMPTY_LIST;
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity);
        },
    });

    const profiles = isCurrentProfile ? currentProfiles : otherProfiles;

    useEffect(() => {
        setProfileIdentity(identity);
    }, [identity.id, identity.source, isCurrentProfile, setProfileIdentity]);

    if (isLoading && !isCurrentProfile) {
        return <Loading />;
    }

    if (!identity) {
        notFound();
    }

    return <ProfilePage profiles={profiles} />;
}
