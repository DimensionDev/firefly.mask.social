'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { getFollowInList } from '@/components/FollowInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, type SocialSource } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function MutualFollowersList({ profileId, source }: { profileId: string; source: SocialSource }) {
    const myProfile = useCurrentProfile(source);
    const myProfileId = myProfile?.profileId;

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['profiles', source, 'mutual-followers', myProfileId, profileId],
        async queryFn({ pageParam }) {
            const provider = resolveSocialMediaProvider(source);
            return provider.getMutualFollowers(profileId, createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page?.data ?? EMPTY_LIST),
    });

    return (
        <ListInPage
            source={source}
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                key: `${ScrollListKey.MutualFollowers}:${source}:${profileId}`,
                computeItemKey: (index, item: Profile) => `${item.profileId}-${index}`,
                itemContent: (index, item: Profile) => getFollowInList(index, item),
            }}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
        />
    );
}
