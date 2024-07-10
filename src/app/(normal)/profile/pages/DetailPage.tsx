'use client';

import { skipToken, useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import { type SourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { useMyAllProfiles } from '@/hooks/useMyAllProfiles.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface Props {
    identity: string;
    source: SourceInURL;
}

export function ProfileDetailPage({ identity, source }: Props) {
    const currentSource = resolveSourceFromUrl(source);

    const myProfiles = useMyAllProfiles();
    const isMyProfile = myProfiles.some((profile) => profile.source === currentSource && profile.identity === identity);
    const { data: otherProfiles = EMPTY_LIST, isLoading } = useQuery({
        enabled: !isMyProfile,
        queryKey: ['all-profiles', currentSource, identity],
        queryFn: isMyProfile
            ? skipToken
            : async () => {
                  if (!identity) return EMPTY_LIST;
                  return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity, currentSource);
              },
    });

    const profiles = isMyProfile ? myProfiles : otherProfiles;

    if (isLoading && !isMyProfile) {
        return <Loading />;
    }

    if (!identity) {
        notFound();
    }

    return (
        <ProfileContext.Provider initialState={{ source: currentSource, identity }}>
            <ProfilePage profiles={profiles} />
        </ProfileContext.Provider>
    );
}
