import type { UseSuspenseInfiniteQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import { usePostState } from '@/store/usePostStore.js';

export interface FilteredPostQueryResult extends UseSuspenseInfiniteQueryResult<Post[]> {
    /** typing guardian, no runtime cost */
    __filtered: true;
}

export function useFilteredQueryResult(
    source: SocialPlatform,
    query: UseSuspenseInfiniteQueryResult<Post[]>,
): FilteredPostQueryResult {
    const profile = useCurrentProfile(source);
    const { allBlockedUsers } = usePostState();
    const key = `${source}:${profile?.profileId}`;
    const blockedUsers = allBlockedUsers[key] || EMPTY_LIST;

    const filtered = useMemo(() => {
        if (!blockedUsers.length) return query.data;
        return query.data.filter((x) => !blockedUsers.includes(x.author.profileId));
    }, [query.data, blockedUsers]);

    return { ...query, data: filtered } as FilteredPostQueryResult;
}
