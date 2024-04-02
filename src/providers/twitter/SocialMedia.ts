import type { Pageable, PageIndicator } from '@masknet/shared-base';
import { compact } from 'lodash-es';
import { getSession } from 'next-auth/react';

import { SocialPlatform } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import {
    type Notification,
    type Post,
    type Profile,
    ProfileStatus,
    type Provider,
    type Reaction,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

// @ts-ignore
class TwitterSocialMedia implements Provider {
    get type() {
        return SessionType.Twitter;
    }

    async me(): Promise<Profile> {
        const session = await getSession();
        if (!session) throw new Error('No session found');

        const response = await fetchJSON<
            ResponseJSON<{
                id: string;
                name: string;
                username: string;
            }>
        >('/api/twitter/me');
        if (!response.success) throw new Error('Failed to fetch user profile');

        return {
            profileId: response.data.id,
            displayName: response.data.name,
            handle: response.data.username,
            fullHandle: response.data.username,
            pfp: session.user?.image ?? '',
            followerCount: 0,
            followingCount: 0,
            status: ProfileStatus.Active,
            verified: true,
            source: SocialPlatform.Twitter,
        };
    }

    follow(profileId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    unfollow(profileId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    discoverPosts(indicator?: PageIndicator | undefined): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    discoverPostsById(
        profileId: string,
        indicator?: PageIndicator | undefined,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getNotifications(indicator?: PageIndicator | undefined): Promise<Pageable<Notification, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getPostById(postId: string): Promise<Post> {
        throw new Error('Not implemented');
    }

    getProfileById(profileId: string): Promise<Profile> {
        throw new Error('Not implemented');
    }

    getProfileByHandle(handle: string): Promise<Profile> {
        throw new Error('Not implemented');
    }

    getCollectedPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getThreadByPostId(postId: string): Promise<Post[]> {
        throw new Error('Not implemented');
    }

    upvotePost(postId: string): Promise<Reaction> {
        throw new Error('Not implemented');
    }

    unvotePost(postId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    searchProfiles(q: string, indicator?: PageIndicator | undefined): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Not implemented');
    }

    async publishPost(post: Post): Promise<string> {
        const response = await fetchJSON<
            ResponseJSON<{
                id: string;
            }>
        >('/api/twitter/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inReplyToTweetId: post.parentPostId,
                text: post.metadata.content?.content ?? '',
                mediaIds: compact(post.mediaObjects?.map((x) => x.id)),
            }),
        });

        if (!response.success) throw new Error('Failed to publish post');
        return response.data.id;
    }
}

export const TwitterSocialMediaProvider = new TwitterSocialMedia();
