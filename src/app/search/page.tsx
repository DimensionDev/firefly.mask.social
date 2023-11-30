'use client';

import { safeUnreachable } from '@masknet/kit';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';

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

    const { data } = useSuspenseInfiniteQuery({
        queryKey: ['search'],
        queryFn: async ({ pageParam }) => {
            if (searchType === SearchType.Profiles) {
                switch (currentSocialPlatform) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchProfiles(
                            searchText,
                            createIndicator(undefined, pageParam),
                        );
                    case SocialPlatform.Farcaster:
                        return HubbleSocialMediaProvider.searchProfiles(
                            searchText,
                            createIndicator(undefined, pageParam),
                        );
                    default:
                        return;
                }
            } else if (searchType === SearchType.Posts) {
                switch (currentSocialPlatform) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchPosts(searchText, createIndicator(undefined, pageParam));
                    case SocialPlatform.Farcaster:
                        return HubbleSocialMediaProvider.searchPosts(searchText, createIndicator(undefined, pageParam));
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

    console.log('DEBUG: data');
    console.log(data);

    if (searchType === SearchType.Profiles) {
        const profiles = data?.data as Profile[];
        return profiles.map((profile: Profile) => <ProfileInList key={profile.profileId} profile={profile} />);
    }

    if (searchType === SearchType.Posts) {
        const posts = data?.data as Post[];
        return posts.map((post: Post) => <SinglePost key={post.postId} post={post} />);
    }

    return null;
}
