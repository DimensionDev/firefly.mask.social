'use client';

import { skipToken, useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation.js';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import { type SourceInURL } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createProfileTab } from '@/helpers/createDummyFireflyProfile.js';
import { isSameFireflyProfile } from '@/helpers/isSameProfile.js';
import { resolveSourceFromUrl } from '@/helpers/resolveSource.js';
import { useCurrentFireflyProfilesAll } from '@/hooks/useCurrentFireflyProfile.js';
import { FireflyProfileContext } from '@/hooks/useProfileContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

interface Props {
    identity: string;
    source: SourceInURL;
}

export function ProfileDetailPage({ identity, source }: Props) {
    const currentSource = resolveSourceFromUrl(source);

    const currentFireflyProfilesAll = useCurrentFireflyProfilesAll();
    const isMyProfile = currentFireflyProfilesAll.some((profile) =>
        isSameFireflyProfile(profile, createProfileTab(currentSource, identity)),
    );

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

    if (isLoading && !isMyProfile) {
        return <Loading />;
    }

    if (!identity) {
        notFound();
    }

    const profiles = isMyProfile ? currentFireflyProfilesAll : otherProfiles;

    return (
        <FireflyProfileContext.Provider initialState={{ source: currentSource, identity }}>
            <ProfilePage profiles={profiles} />
        </FireflyProfileContext.Provider>
    );
}
