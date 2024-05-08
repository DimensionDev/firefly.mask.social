'use client';

import { useQuery } from '@tanstack/react-query';
import { compact, uniqBy } from 'lodash-es';
import { useSearchParams } from 'next/navigation.js';
import { useMemo } from 'react';

import { ProfilePage } from '@/app/(normal)/pages/Profile.js';
import { Loading } from '@/components/Loading.js';
import { NotLoginFallback } from '@/components/NotLoginFallback.js';
import { SourceTabs } from '@/components/SourceTabs.js';
import { Source, SourceInURL } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowSource.js';
import { resolveSource } from '@/helpers/resolveSource.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { useUpdateCurrentVisitingProfile } from '@/hooks/useCurrentVisitingProfile.js';
import { ProfileContext } from '@/hooks/useProfileContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export default function Page() {
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);
    const currentProfile = useCurrentProfile(currentSocialSource);

    const searchParams = useSearchParams();
    const sourceFromParams = searchParams.get('source') as SourceInURL;
    const identityFromParams = searchParams.get('identity');

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

    useUpdateCurrentVisitingProfile(currentProfile);

    if (isLoading) {
        return <Loading />;
    }

    if (!currentProfile) {
        return (
            <div>
                <SourceTabs />
                <NotLoginFallback source={currentSocialSource} />
            </div>
        );
    }

    return (
        <ProfileContext.Provider
            initialState={{
                source: sourceFromParams ? resolveSource(sourceFromParams) : currentProfile.source,
                identity:
                    identityFromParams ??
                    (currentSource === Source.Lens ? currentProfile?.handle : currentProfile?.profileId),
            }}
        >
            <ProfilePage
                hiddenTitle
                profiles={profiles ? uniqBy([...profiles, ...defaultProfiles], (x) => x.identity) : defaultProfiles}
            />
        </ProfileContext.Provider>
    );
}
