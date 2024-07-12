import { useQuery } from '@tanstack/react-query';
import { compact, uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';

export function useCurrentFireflyProfile(source: SocialSource) {
    const all = useCurrentFireflyProfiles()
    return all.find((x) => x.source === source) ?? null;
}

export function useCurrentFireflyProfiles() {
    const currentProfileAll = useCurrentProfileAll();

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

export function useCurrentFireflyProfilesAll(enabled = true) {
    const currentProfileAll = useCurrentProfileAll();
    const currentFireflyProfiles = useCurrentFireflyProfiles();

    const { data: profiles } = useQuery({
        enabled,
        queryKey: ['all-profiles', 'myself', currentProfileAll],
        queryFn: async () => {
            return FireflySocialMediaProvider.getAllPlatformProfiles(
                resolveProfileId(currentProfileAll[Source.Lens]),
                resolveProfileId(currentProfileAll[Source.Farcaster]),
                resolveProfileId(currentProfileAll[Source.Twitter]),
            );
        },
    });

    return useMemo(() => {
        if (!profiles) return currentFireflyProfiles;
        // profile from currentProfileAll is always the first
        return uniqBy([...currentFireflyProfiles, ...profiles], (x) => `${x.source}/${x.identity}`);
    }, [profiles, currentFireflyProfiles]);
}
