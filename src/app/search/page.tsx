'use client';

import { safeUnreachable } from '@masknet/kit';
import { useSuspenseQuery } from '@tanstack/react-query';

import { SinglePost } from '@/components/Posts/SinglePost.jsx';
import { ProfileInList } from '@/components/ProfileInList.jsx';
import { SearchType, SocialPlatform } from '@/constants/enum.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { LensSocialMediaProvider } from '@/providers/lens/SocialMedia.js';
import type { Post, Profile } from '@/providers/types/SocialMedia.js';
import { useGlobalState } from '@/store/useGlobalStore.js';
import { useSearchStore } from '@/store/useSearchStore.js';

export default function Page() {
    const { searchText, searchType } = useSearchStore();
    const { currentSocialPlatform } = useGlobalState();

    const { data } = useSuspenseQuery({
        queryKey: ['search'],
        queryFn: async () => {
            if (searchType === SearchType.Profiles) {
                switch (currentSocialPlatform) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchProfiles(searchText);
                    case SocialPlatform.Farcaster:
                        return HubbleSocialMediaProvider.searchProfiles(searchText);
                    default:
                        return;
                }
            } else if (searchType === SearchType.Posts) {
                switch (currentSocialPlatform) {
                    case SocialPlatform.Lens:
                        return LensSocialMediaProvider.searchPosts(searchText);
                    case SocialPlatform.Farcaster:
                        return HubbleSocialMediaProvider.searchPosts(searchText);
                    default:
                        return;
                }
            } else {
                safeUnreachable(searchType);
                return;
            }
        },
    });

    if (searchType === SearchType.Profiles) {
        const profiles = data?.data as Profile[];
        return profiles.map((profile: Profile) => <ProfileInList key={profile.handle} profile={profile} />);
    }

    if (searchType === SearchType.Posts) {
        const posts = data?.data as Post[];
        return posts.map((post: Post) => <SinglePost key={post.postId} post={post} />);
    }

    return;
}
