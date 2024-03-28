'use client';

import { t, Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { createIndicator } from '@masknet/shared-base';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import { useInView } from 'react-cool-inview';

import LoadingIcon from '@/assets/loading.svg';
import { NoResultsFallback } from '@/components/NoResultsFallback.js';
import { SinglePost } from '@/components/Posts/SinglePost.js';
import { ProfileInList } from '@/components/Search/ProfileInList.js';
import { SearchType, SocialPlatform } from '@/constants/enum.js';
import { useNavigatorTitle } from '@/hooks/useNavigatorTitle.js';
import { FarcasterSocialMediaProvider } from '@/providers/farcaster/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post, Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchState } from '@/store/useSearchState.js';

export default function Page() {
    const { searchKeyword, searchType } = useSearchState();
    const { currentSource } = useGlobalState();

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

            const indicator = pageParam ? createIndicator(undefined, pageParam) : undefined;

            if (searchType === SearchType.Users) {
                switch (currentSource) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchProfiles(searchKeyword, indicator);
                    case SocialPlatform.Farcaster:
                        return FarcasterSocialMediaProvider.searchProfiles(searchKeyword, indicator);
                    default:
                        safeUnreachable(currentSource);
                        return;
                }
            } else if (searchType === SearchType.Posts) {
                switch (currentSource) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchPosts(searchKeyword, indicator);
                    case SocialPlatform.Farcaster:
                        return FarcasterSocialMediaProvider.searchPosts(searchKeyword, indicator);
                    default:
                        safeUnreachable(currentSource);
                        return;
                }
            } else {
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

    const { observe } = useInView({
        rootMargin: '300px 0px',
        onChange: async ({ inView }) => {
            if (!inView || !hasNextPage || isFetching || isFetchingNextPage) {
                return;
            }
            await fetchNextPage();
        },
    });

    useNavigatorTitle(t`Search`);

    return (
        <div>
            {results.length ? (
                results.map((item) => {
                    if (searchType === SearchType.Users) {
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
            )}

            {hasNextPage && results.length ? (
                <div className="flex items-center justify-center p-2" ref={observe}>
                    <LoadingIcon width={16} height={16} className="animate-spin" />
                </div>
            ) : null}
        </div>
    );
}
