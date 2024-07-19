import { useQuery } from '@tanstack/react-query';
import { compact, uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
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
                      identity: currentFarcasterProfile.profileId,
                      source: Source.Farcaster,
                      displayName: currentFarcasterProfile.handle,
                      __origin__: null,
                  }
                : undefined,
            currentLensProfile
                ? {
                      identity: currentLensProfile.handle,
                      source: Source.Lens,
                      displayName: currentLensProfile.handle,
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
        ]).sort(
            (a, b) =>
                SORTED_SOCIAL_SOURCES.indexOf(a.source as SocialSource) -
                SORTED_SOCIAL_SOURCES.indexOf(b.source as SocialSource),
        );
    }, [currentProfileAll]);
}

export function useCurrentFireflyProfilesAll() {
    const currentProfileAll = useCurrentProfileAll();
    const currentFireflyProfiles = useCurrentFireflyProfiles();

    const lensIdentity = resolveProfileId(currentProfileAll[Source.Lens]);
    const farcasterIdentity = resolveProfileId(currentProfileAll[Source.Farcaster]);
    const twitterIdentity = resolveProfileId(currentProfileAll[Source.Twitter]);

    const { data: profiles = EMPTY_LIST } = useQuery({
        queryKey: ['all-profiles', 'my-own', lensIdentity, farcasterIdentity, twitterIdentity],
        enabled: !!lensIdentity || !!farcasterIdentity || !!twitterIdentity,
        queryFn: async () => {
            return [
                ...(await FireflySocialMediaProvider.getAllPlatformProfiles(lensIdentity, farcasterIdentity)),
                ...(await FireflySocialMediaProvider.getAllPlatformProfiles(undefined, undefined, twitterIdentity)),
            ];
        },
        select: (profiles) => uniqBy(profiles, (x) => `${x.source}/${x.identity}`),
        staleTime: 1000 * 60 * 5,
    });

    return useMemo(() => {
        return uniqBy([...currentFireflyProfiles, ...profiles], (x) => `${x.source}/${x.identity}`);
    }, [currentFireflyProfiles, profiles]);
}
