import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { getProfileById } from '@/services/getProfileById.js';

export function useRefreshedProfile<T extends Profile | null | undefined>(profile?: T): UseQueryResult<T> {
    const handleOrProfileId = resolveFireflyProfileId(profile ?? null);
    return useQuery({
        queryKey: ['profile', profile?.source, handleOrProfileId],
        async queryFn() {
            try {
                if (!profile || !handleOrProfileId) return null as T;
                const refreshed = await getProfileById(profile.source, handleOrProfileId);
                return refreshed ?? profile;
            } catch {
                return profile;
            }
        },
        initialData: profile,
    });
}
