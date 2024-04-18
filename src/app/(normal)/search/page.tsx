'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator, EMPTY_LIST } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ChannelInList } from '@/components/ChannelInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ProfileInList } from '@/components/ProfileInList.js';
import { SearchType } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Channel, Post, Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

const getSearchItemContent = (index: number, item: Post | Profile | Channel, searchType: SearchType) => {
    switch (searchType) {
        case SearchType.Users:
            const profile = item as Profile;
            return <ProfileInList key={profile.profileId} profile={profile} />;
        case SearchType.Posts:
            const post = item as Post;
            return <SinglePost key={post.postId} post={post} />;
        case SearchType.Channels:
            const channel = item as Channel;
            return <ChannelInList key={channel.id} channel={channel} />;
        default:
            safeUnreachable(searchType);
            return null;
    }
};

export default function Page() {
    const { searchKeyword, searchType } = useSearchStateStore();
    const { currentSource } = useGlobalState();

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['search', searchType, searchKeyword, currentSource],
        queryFn: async ({ pageParam }) => {
            if (!searchKeyword) return;

            const provider = resolveSocialMediaProvider(currentSource);
            if (!provider) return;

            const indicator = pageParam ? createIndicator(undefined, pageParam) : undefined;

            switch (searchType) {
                case SearchType.Users:
                    return provider?.searchProfiles(searchKeyword, indicator);
                case SearchType.Posts:
                    return provider?.searchPosts(searchKeyword, indicator);
                case SearchType.Channels:
                    return provider?.searchChannels(searchKeyword, indicator);
                default:
                    safeUnreachable(searchType);
                    return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select(data) {
            return compact(data.pages.flatMap((x) => x?.data as Array<Profile | Post | Channel>) || EMPTY_LIST);
        },
    });

    useNavigatorTitle(t`Search`);

    return (
        <ListInPage
            queryResult={queryResult}
            VirtualListProps={{
                computeItemKey: (index, item) => {
                    switch (searchType) {
                        case SearchType.Users:
                            const profile = item as Profile;
                            return `${profile.profileId}_${index}`;
                        case SearchType.Posts:
                            const post = item as Post;
                            return `${post.postId}_${index}`;
                        case SearchType.Channels:
                            const channel = item as Channel;
                            return `${channel.id}_${index}`;
                        default:
                            safeUnreachable(searchType);
                            return index;
                    }
                },
                itemContent: (index, item) => getSearchItemContent(index, item, searchType),
            }}
            NoResultsFallbackProps={{
                message: (
                    <div className="mx-16">
                        <div className="text-sm text-main">{t`No results for "${searchKeyword}"`}</div>
                        <p className="mt-4 text-center text-sm text-second">
                            <Trans>Try searching for something else.</Trans>
                        </p>
                    </div>
                ),
            }}
        />
    );
}
