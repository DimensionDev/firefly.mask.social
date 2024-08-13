import { useQuery } from '@tanstack/react-query';
import { compact, uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';

export function useCurrentFireflyProfiles() {
    const currentProfileAll = useCurrentProfileAll();

    // convert currentProfileAll to currentFireflyProfiles
    return useMemo<FireflyProfile[]>(() => {
        const currentFarcasterProfile = currentProfileAll[Source.Farcaster];
        const currentLensProfile = currentProfileAll[Source.Lens];
        const currentTwitterProfile = currentProfileAll[Source.Twitter];

        return compact([
            currentFarcasterProfile
                ? {
                      identity: {
                          id: currentFarcasterProfile.profileId,
                          source: Source.Farcaster,
                      },
                      displayName: currentFarcasterProfile.handle,
                      __origin__: null,
                  }
                : undefined,
            currentLensProfile
                ? {
                      identity: {
                          id: currentLensProfile.handle,
                          source: Source.Lens,
                      },
                      displayName: currentLensProfile.handle,
                      __origin__: null,
                  }
                : undefined,
            currentTwitterProfile
                ? {
                      identity: {
                          id: currentTwitterProfile.profileId,
                          source: Source.Twitter,
                      },
                      displayName: currentTwitterProfile.handle,
                      __origin__: null,
                  }
                : undefined,
        ]).sort(
            (a, b) =>
                SORTED_SOCIAL_SOURCES.indexOf(a.identity.source as SocialSource) -
                SORTED_SOCIAL_SOURCES.indexOf(b.identity.source as SocialSource),
        );
    }, [currentProfileAll]);
}

export function useCurrentFireflyProfilesAll() {
    const currentProfileAll = useCurrentProfileAll();
    const currentFireflyProfiles = useCurrentFireflyProfiles();

    const lensIdentity = resolveFireflyProfileId(currentProfileAll[Source.Lens]);
    const farcasterIdentity = resolveFireflyProfileId(currentProfileAll[Source.Farcaster]);
    const twitterIdentity = resolveFireflyProfileId(currentProfileAll[Source.Twitter]);

    const queryEnabled = !!lensIdentity || !!farcasterIdentity || !!twitterIdentity;

    const { data: profiles = EMPTY_LIST } = useQuery({
        queryKey: ['all-profiles', 'my-own', lensIdentity, farcasterIdentity, twitterIdentity],
        enabled: queryEnabled,
        queryFn: async () => {
            const withTwitterProfiles = twitterIdentity
                ? await FireflySocialMediaProvider.getAllPlatformProfiles(undefined, undefined, twitterIdentity)
                : [];
            const connectedProfiles =
                lensIdentity || farcasterIdentity ? await FireflySocialMediaProvider.getAllPlatformProfiles() : [];
            return [
                ...connectedProfiles,
                ...withTwitterProfiles.filter((profile) =>
                    lensIdentity || farcasterIdentity ? profile.identity.source === Source.Twitter : true,
                ),
            ];
        },
        select: (profiles) => uniqBy(profiles, (x) => `${x.identity.source}/${x.identity.id}`),
        staleTime: 1000 * 60 * 5,
    });

    return useMemo(() => {
        return uniqBy([...currentFireflyProfiles, ...profiles], (x) => `${x.identity.source}/${x.identity.id}`);
    }, [currentFireflyProfiles, profiles]);
}
