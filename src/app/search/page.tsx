'use client';

import { safeUnreachable } from '@masknet/kit';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useMemo } from 'react';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ProfileInList } from '@/components/ProfileInList.js';
import { SearchType, SocialPlatform } from '@/constants/enum.js';
import { createIndicator } from '@/maskbook/packages/shared-base/src/index.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post, Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchStore } from '@/store/useSearchStore.js';

export default function Page() {
    const { searchText, searchType } = useSearchStore();
    const { currentSocialPlatform } = useGlobalState();

    const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isFetching } = useSuspenseInfiniteQuery({
        queryKey: ['search', searchType, searchText, currentSocialPlatform],
        queryFn: async ({ pageParam }) => {
            if (!searchText) return;

            const indicator = pageParam ? createIndicator(undefined, pageParam) : undefined;

            if (searchType === SearchType.Profiles) {
                switch (currentSocialPlatform) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchProfiles(searchText, indicator);
                    case SocialPlatform.Farcaster:
                        return HubbleSocialMediaProvider.searchProfiles(searchText, indicator);
                    default:
                        return;
                }
            } else if (searchType === SearchType.Posts) {
                switch (currentSocialPlatform) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchPosts(searchText, indicator);
                    case SocialPlatform.Farcaster:
                        return HubbleSocialMediaProvider.searchPosts(searchText, indicator);
                    default:
                        return;
                }
            } else {
                safeUnreachable(searchType);
                return;
            }
        },
        initialPageParam: '',
        getNextPageParam: (lastPage) => lastPage?.nextIndicator?.id,
    });

    const { observe } = useInView({
        rootMargin: '300px 0px',
        onChange: async ({ inView }) => {
            if (!inView || !hasNextPage || isFetching || isFetchingNextPage) {
                return;
            }
            await fetchNextPage();
        },
    });

    const results = useMemo(() => {
        return compact(data.pages.flatMap((x) => x?.data as Array<Profile | Post>));
    }, [data.pages]);

    return (
        <div>
            {results.length ? (
                results.map((item) => {
                    if (searchType === SearchType.Profiles) {
                        const profile = item as Profile;
                        return <ProfileInList key={profile.profileId} profile={profile} />;
                    }
                    if (searchType === SearchType.Posts) {
                        const post = item as Post;
                        return <SinglePost key={post.postId} post={post} />;
                    }
                    return null;
                })
            ) : (
                <NoResultsFallback />
            )}

            {hasNextPage && results.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
