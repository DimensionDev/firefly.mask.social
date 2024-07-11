import { useQuery } from '@tanstack/react-query';
import { compact, sortBy, uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { Source } from '@/constants/enum.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function useMyAllProfiles(enabled = true) {
    const map = useCurrentProfileAll();
    const lensProfile = map[Source.Lens];
    const farcasterProfile = map[Source.Farcaster];
    const twitterProfile = map[Source.Twitter];

    const lensHandle = lensProfile?.handle;
    const farcasterProfileId = farcasterProfile?.profileId;
    const twitterId = twitterProfile?.profileId;

    const { data: profiles } = useQuery({
        enabled,
        queryKey: ['all-profiles', 'myself', lensHandle, farcasterProfileId, twitterId],
        queryFn: async () => {
            return FireflySocialMediaProvider.getAllPlatformProfiles(lensHandle, farcasterProfileId, twitterId);
        },
    });

    const defaultProfiles = useMemo(() => {
        return compact([
            farcasterProfileId
                ? {
                      identity: farcasterProfileId,
                      source: Source.Farcaster,
                      displayName: farcasterProfile.handle,
                      __origin__: null,
                  }
                : undefined,
            lensHandle
                ? {
                      identity: lensHandle,
                      source: Source.Lens,
                      displayName: lensHandle,
                      __origin__: null,
                  }
                : undefined,
            twitterId
                ? {
                      identity: twitterId,
                      source: Source.Twitter,
                      displayName: twitterProfile.handle,
                      __origin__: null,
                  }
                : undefined,
        ]);
    }, [lensHandle, farcasterProfileId, farcasterProfile?.handle, twitterId, twitterProfile?.handle]);

    return useMemo(() => {
        if (!profiles) return defaultProfiles;

        const identityMap: Partial<Record<Source, string>> = {
            [Source.Farcaster]: farcasterProfileId,
            [Source.Lens]: lensHandle,
            [Source.Twitter]: twitterId,
        };
        return sortBy(
            uniqBy([...profiles, ...defaultProfiles], (x) => `${x.source}/${x.identity}`),
            (x) => {
                const preferIdentity = identityMap[x.source];
                return preferIdentity === x.identity ? -1 : 0;
            },
        );
    }, [defaultProfiles, farcasterProfileId, lensHandle, profiles, twitterId]);
}
