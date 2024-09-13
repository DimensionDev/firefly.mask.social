'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { ProfileInList } from '@/components/ProfileInList.js';
import { ScrollListKey, type SocialSource } from '@/constants/enum.js';
import { createIndicator, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { getSuggestedFollowsInPage } from '@/services/getSuggestedFollows.js';

interface Props {
    source: SocialSource;
}

function getSuggestedFollowUserInList(index: number, profile: Profile) {
    return <ProfileInList profile={profile} key={`${profile.profileId}-${index}`} />;
}

export default function SuggestedFollowUsersList({ source }: Props) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['suggested-follows', source],
        queryFn({ pageParam }) {
            return getSuggestedFollowsInPage(source, createIndicator(undefined, pageParam));
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
                key: `${ScrollListKey.SuggestedUsers}:${source}`,
                computeItemKey: (index, item) => `${item.profileId}-${index}`,
                itemContent: (index, item) => getSuggestedFollowUserInList(index, item),
            }}
            NoResultsFallbackProps={{
                className: 'md:pt-[228px] max-md:py-20',
            }}
        />
    );
}
