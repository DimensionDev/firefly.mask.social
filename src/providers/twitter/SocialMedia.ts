import { t } from '@lingui/macro';
import type { Pageable, PageIndicator } from '@masknet/shared-base';
import { compact } from 'lodash-es';
import { getSession } from 'next-auth/react';

import { SocialPlatform } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { resolveTwitterReplyRestriction } from '@/helpers/resolveTwitterReplyRestriction.js';
import {
    type Channel,
    type Notification,
    type Post,
    type Profile,
    ProfileStatus,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import type { ResponseJSON } from '@/types/index.js';

class TwitterSocialMedia implements Provider {
    unmirrorPost?: ((postId: string, authorId?: number | undefined) => Promise<void>) | undefined;
    mirrorPost(postId: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    commentPost(postId: string, post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    collectPost(postId: string, collectionId?: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    deletePost(postId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new Error('Method not implemented.');
    }

    getProfilesByIds(ids: string[]): Promise<Profile[]> {
        throw new Error('Method not implemented.');
    }

    getPostsBeMentioned(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsLiked(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsReplies(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getFollowers(profileId: string): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    getFollowings(profileId: string): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    isFollowedByMe(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    isFollowingMe(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    follow(profileId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    unfollow(profileId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    discoverPostsById(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        throw new Error('Not implemented');
    }

    async getPostById(postId: string): Promise<Post> {
        return {
            postId,
        } as unknown as Post;
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

    async getLikedPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getReplesPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getThreadByPostId(postId: string): Promise<Post[]> {
        throw new Error('Not implemented');
    }

    upvotePost(postId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    unvotePost(postId: string): Promise<void> {
        throw new Error('Not implemented');
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getChannelById(channelId: string): Promise<Channel> {
        throw new Error('Method not implemented.');
    }

    getChannelByHandle(channelHandle: string): Promise<Channel> {
        throw new Error('Method not implemented.');
    }

    getChannelsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByChannelId(channelId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByChannelHandle(channelHandle: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    searchChannels(q: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

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

    async quotePost(postId: string, post: Post): Promise<string> {
        const response = await fetchJSON<
            ResponseJSON<{
                id: string;
            }>
        >('/api/twitter/compose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                quoteTwitterId: post.parentPostId,
                replySettings: post.restriction ? resolveTwitterReplyRestriction(post.restriction) : undefined,
                text: post.metadata.content?.content ?? '',
                mediaIds: compact(post.mediaObjects?.map((x) => x.id)),
            }),
        });

        if (!response.success) throw new Error(t`Failed to quote post.`);
        return response.data.id;
    }

    async publishPost(post: Post): Promise<string> {
        const response = await fetchJSON<
            ResponseJSON<{
                id: string;
            }>
        >('/api/twitter/compose', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inReplyToTweetId: post.parentPostId,
                replySettings: post.restriction ? resolveTwitterReplyRestriction(post.restriction) : undefined,
                text: post.metadata.content?.content ?? '',
                mediaIds: compact(post.mediaObjects?.map((x) => x.id)),
            }),
        });

        if (!response.success) throw new Error(t`Failed to publish post.`);
        return response.data.id;
    }
}

export const TwitterSocialMediaProvider = new TwitterSocialMedia();
