'use client';

import { useQuery } from '@tanstack/react-query';
import { compact, uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import { Source } from '@/constants/enum.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';
import { useProfileTabState } from '@/store/useProfileTabsStore.js';

export default function Page() {
    const { currentProfileTabState } = useProfileTabState();

    const currentLensProfile = useLensStateStore.use.currentProfile();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const currentTwitterProfile = useTwitterStateStore.use.currentProfile();

    const { data: profiles, isLoading } = useQuery({
        queryKey: [
            'all-profiles',
            'myself',
            currentLensProfile?.handle,
            currentFarcasterProfile?.profileId,
            currentTwitterProfile?.profileId,
        ],
        queryFn: async () => {
            return FireflySocialMediaProvider.getAllPlatformProfiles(
                currentLensProfile?.handle,
                currentFarcasterProfile?.profileId,
                currentTwitterProfile?.profileId,
            );
        },
    });

    const defaultProfiles = useMemo(() => {
        return compact([
            currentLensProfile
                ? {
                      identity: currentLensProfile.handle,
                      source: Source.Lens,
                      displayName: currentLensProfile.handle,
                      __origin__: null,
                  }
                : undefined,
            currentFarcasterProfile
                ? {
                      identity: currentFarcasterProfile.profileId,
                      source: Source.Farcaster,
                      displayName: currentFarcasterProfile.handle,
                      __origin__: null,
                  }
                : undefined,
            currentTwitterProfile
                ? {
                      identity: currentTwitterProfile.profileId,
                      source: Source.Twitter,
                      displayName: currentTwitterProfile.handle,
                      __origin__: null,
                  }
                : undefined,
        ]);
    }, [currentLensProfile, currentFarcasterProfile, currentTwitterProfile]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <ProfileContext.Provider
            initialState={{
                source: currentProfileTabState.source,
                identity:
                    currentProfileTabState.identity ||
                    defaultProfiles.find((x) => x.source === currentProfileTabState.source)?.identity,
            }}
        >
            <ProfilePage
                profiles={profiles ? uniqBy([...profiles, ...defaultProfiles], (x) => x.identity) : defaultProfiles}
            />
        </ProfileContext.Provider>
    );
}
