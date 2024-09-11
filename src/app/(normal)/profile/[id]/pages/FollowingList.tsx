'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { getFollowInList } from '@/components/FollowInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { ScrollListKey, type SocialSourceInURL } from '@/constants/enum.js';
import { createIndicator, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { resolveSocialSource } from '@/helpers/resolveSource.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function FollowingList({ profileId, source }: { profileId: string; source: SocialSourceInURL }) {
    const socialSource = resolveSocialSource(source);
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['profiles', socialSource, 'following', profileId],
        async queryFn({ pageParam }) {
            const provider = resolveSocialMediaProvider(socialSource);
            return provider.getFollowings(profileId, createIndicator(undefined, pageParam));
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => (lastPage as Pageable<Profile, PageIndicator>)?.nextIndicator?.id,
        select: (data) => data.pages.flatMap((page) => page?.data ?? []),
    });

    return (
        <ListInPage
            key={source}
            queryResult={queryResult}
            VirtualListProps={{
                key: `${ScrollListKey.Following}:${source}:${profileId}`,
                computeItemKey: (index, item: Profile) => `${item.profileId}-${index}`,
                itemContent: (index, item) => getFollowInList(index, item),
            }}
            NoResultsFallbackProps={{
                className: 'pt-[228px]',
            }}
        />
    );
}
