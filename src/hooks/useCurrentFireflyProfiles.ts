import { useQuery } from '@tanstack/react-query';
import { compact, uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import type { ProfileTab } from '@/hooks/useProfileTabContext.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';

export function useCurrentFireflyProfiles(profileTab: ProfileTab) {
    throw new NotImplementedError();
}

export function useCurrentFireflyProfilesAll(profileTab?: ProfileTab) {
    const currentProfileAll = useCurrentProfileAll();

    // convert currentProfileAll to currentFireflyProfiles
    const currentFireflyProfiles = useMemo<FireflyProfile[]>(() => {
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

    const { data: profilesByWallet = EMPTY_LIST } = useQuery({
        queryKey: ['all-profiles', profileTab],
        queryFn: async () => {
            if (profileTab?.source !== Source.Wallet || !profileTab?.identity) return EMPTY_LIST;
            return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(profileTab.source, profileTab.identity);
        },
    });

    const { data: profilesByPlatforms = EMPTY_LIST } = useQuery({
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
        return uniqBy(
            [...currentFireflyProfiles, ...profilesByPlatforms, ...profilesByWallet],
            (x) => `${x.source}/${x.identity}`,
        );
    }, [currentFireflyProfiles, profilesByPlatforms, profilesByWallet]);
}
