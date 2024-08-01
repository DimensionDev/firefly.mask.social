'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

import { ListInPage } from '@/components/ListInPage.js';
import { ProfileInList } from '@/components/ProfileInList.js';
import { ScrollListKey, type SocialSource, Source } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

interface Props {
    source: SocialSource;
}

export function getSuggestedFollowUserInList(index: number, profile: Profile) {
    return <ProfileInList profile={profile} key={`${profile.profileId}-${index}`} />;
}

export default function SuggestedFollowUsersList({ source }: Props) {
    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['suggested-follows', source],
        queryFn({ pageParam }) {
            if (source === Source.Twitter) return createPageable<Profile>(EMPTY_LIST, createIndicator(undefined));
            const provider = resolveSocialMediaProvider(source);
            return provider.getSuggestedFollows(createIndicator(undefined, pageParam));
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
                className: 'pt-[228px]',
            }}
        />
    );
}
