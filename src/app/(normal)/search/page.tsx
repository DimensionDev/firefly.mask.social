'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import { ChannelInList } from '@/components/ChannelInList.js';
import { ListInPage } from '@/components/ListInPage.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ProfileInList } from '@/components/ProfileInList.js';
import { ScrollListKey, SearchType } from '@/constants/enum.js';
import { narrowToSocialSource } from '@/helpers/narrowToSocialSource.js';
import { createIndicator } from '@/helpers/pageable.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Channel, Post, Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchStateStore } from '@/store/useSearchStore.js';

const getSearchItemContent = (
    index: number,
    item: Post | Profile | Channel,
    searchType: SearchType,
    listKey: string,
) => {
    switch (searchType) {
        case SearchType.Profiles:
            const profile = item as Profile;
            return <ProfileInList key={profile.profileId} profile={profile} listKey={listKey} index={index} />;
        case SearchType.Posts:
            const post = item as Post;
            return <SinglePost key={post.postId} post={post} listKey={listKey} index={index} />;
        case SearchType.Channels:
            const channel = item as Channel;
            return <ChannelInList key={channel.id} channel={channel} listKey={listKey} index={index} />;
        default:
            safeUnreachable(searchType);
            return null;
    }
};

export default function Page() {
    const { searchKeyword, searchType } = useSearchStateStore();
    const currentSource = useGlobalState.use.currentSource();
    const currentSocialSource = narrowToSocialSource(currentSource);

    const queryResult = useSuspenseInfiniteQuery({
        queryKey: ['search', searchType, searchKeyword, currentSource],
        queryFn: async ({ pageParam }) => {
            if (!searchKeyword) return;
            const provider = resolveSocialMediaProvider(currentSocialSource);
            const indicator = pageParam ? createIndicator(undefined, pageParam) : undefined;

            switch (searchType) {
                case SearchType.Profiles:
                    return provider.searchProfiles(searchKeyword, indicator);
                case SearchType.Posts:
                    return provider.searchPosts(searchKeyword.replace(/^#/, ''), indicator);
                case SearchType.Channels:
                    return provider.searchChannels(searchKeyword, indicator);
                default:
                    safeUnreachable(searchType);
                    return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => {
            if (lastPage?.data.length === 0) return;
            return lastPage?.nextIndicator?.id;
        },
        select(data) {
            return compact(data.pages.flatMap((x) => (x?.data ?? []) as Array<Profile | Post | Channel>));
        },
    });

    useNavigatorTitle(t`Search`);

    const listKey = `${ScrollListKey.Search}:${searchType}:${searchKeyword}:${currentSource}`;
    return (
        <ListInPage
            key={listKey}
            queryResult={queryResult}
            VirtualListProps={{
                listKey,
                computeItemKey: (index, item) => {
                    switch (searchType) {
                        case SearchType.Profiles:
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
                itemContent: (index, item) => getSearchItemContent(index, item, searchType, listKey),
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
