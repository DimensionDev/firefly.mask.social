'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';

import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ProfileInList } from '@/components/Search/ProfileInList.js';
import { ScrollListKey, SearchType } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import type { Post, Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchState } from '@/store/useSearchState.js';
import { useCallback } from 'react';
import { VirtualList } from '@/components/VirtualList.js';

export default function Page() {
    const { searchKeyword, searchType } = useSearchState();
    const { currentSource, setScrollIndex } = useGlobalState();

    const {
        data: results,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
        isFetching,
    } = useSuspenseInfiniteQuery({
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
                default:
                    safeUnreachable(searchType);
                    return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
        select(data) {
            return compact(data.pages.flatMap((x) => x?.data as Array<Profile | Post>) || []);
        },
    });

    const onEndReached = useCallback(async () => {
        if (!hasNextPage || isFetching || isFetchingNextPage) {
            return;
        }

        await fetchNextPage();
    }, [hasNextPage, isFetching, isFetchingNextPage]);

    useNavigatorTitle(t`Search`);

    if (!results.length) {
        return (
            <NoResultsFallback
                message={
                    <div className="mx-16">
                        <div className="text-sm text-main">{t`No results for "${searchKeyword}"`}</div>
                        <p className="mt-4 text-center text-sm text-second">
                            <Trans>Try searching for something else.</Trans>
                        </p>
                    </div>
                }
            />
        );
    }

    return (
        <div>
            <VirtualList
                computeItemKey={(index, item) => {
                    switch (searchType) {
                        case SearchType.Users:
                            const profile = item as Profile;
                            return `${profile.profileId}_${index}`;
                        case SearchType.Posts:
                            const post = item as Post;
                            return `${post.postId}_${index}`;
                        default:
                            return index;
                    }
                }}
                data={results}
                endReached={onEndReached}
                itemContent={(index, item) => {
                    switch (searchType) {
                        case SearchType.Users:
                            const profile = item as Profile;
                            return <ProfileInList key={profile.profileId} profile={profile} />;
                        case SearchType.Posts:
                            const post = item as Post;
                            return <SinglePost key={post.postId} post={post} />;
                        default:
                            return null;
                    }
                }}
                useWindowScroll
                components={{
                    Footer: () => {
                        if (!hasNextPage) return null;
                        return (
                            <div className="flex items-center justify-center p-2">
                                <LoadingIcon width={16} height={16} className="animate-spin" />
                            </div>
                        );
                    },
                }}
            />
        </div>
    );
}
