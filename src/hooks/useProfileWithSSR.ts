import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

import { resolveFireflyProfileId } from '@/helpers/resolveFireflyProfileId.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { getProfileById } from '@/services/getProfileById.js';

export function useProfileWithSSR<T extends Profile | null | undefined>(initialData?: T): UseQueryResult<T> {
    const handleOrProfileId = resolveFireflyProfileId(initialData ?? null);
    return useQuery({
        queryKey: ['profile', initialData?.source, handleOrProfileId],
        async queryFn() {
            try {
                if (!initialData || !handleOrProfileId) return null as T;
                const fetched = await getProfileById(initialData.source, handleOrProfileId);
                return fetched ?? initialData;
            } catch {
                return initialData;
            }
        },
        initialData,
    });
}
