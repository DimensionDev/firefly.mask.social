import { useQuery } from '@tanstack/react-query';
import { compact, uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST, SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import { resolveProfileId } from '@/helpers/resolveProfileId.js';
import { useCurrentProfileAll } from '@/hooks/useCurrentProfile.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { FireflyProfile } from '@/providers/types/Firefly.js';

export function useFireflyProfile(source: Source, identity?: string) {
    const { data: profiles = EMPTY_LIST, isLoading } = useQuery({
        queryKey: ['all-profiles', source, identity],
        queryFn: async () => {
                  if (!identity) return EMPTY_LIST;
                  return FireflySocialMediaProvider.getAllPlatformProfileByIdentity(identity, currentSource);
              },
    });
    return profiles
}
