import { t } from '@lingui/macro';
import type { Pageable, PageIndicator } from '@masknet/shared-base';
import { compact } from 'lodash-es';
import { getSession } from 'next-auth/react';
import type { TweetV2PaginableTimelineResult } from 'twitter-api-v2';
import type { UserV2 } from 'twitter-api-v2/dist/esm/types/v2/user.v2.types.js';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { formatTwitterPostFromFirefly } from '@/helpers/formatTwitterPostFromFirefly.js';
import { formatTwitterProfileFromFirefly } from '@/helpers/formatTwitterProfileFromFirefly.js';
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
    async unmirrorPost(postId: string, authorId?: number | undefined): Promise<void> {
        const response = await fetchJSON<ResponseJSON<void>>(`/api/twitter/unretweet/${postId}`, { method: 'POST' });
        if (!response.success) throw new Error(response.error.message);
    }

    async mirrorPost(postId: string): Promise<string> {
        const response = await fetchJSON<ResponseJSON<void>>(`/api/twitter/retweet/${postId}`, { method: 'POST' });
        if (!response.success) throw new Error(response.error.message);
        return postId;
    }

    commentPost(postId: string, post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    collectPost(postId: string, collectionId?: string): Promise<void> {
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

    async follow(profileId: string): Promise<void> {
        const response = await fetchJSON<ResponseJSON<void>>(`/api/twitter/follow/${profileId}`, { method: 'POST' });
        if (!response.success) throw new Error(response.error.message);
    }

    async unfollow(profileId: string): Promise<void> {
        const response = await fetchJSON<ResponseJSON<void>>(`/api/twitter/unfollow/${profileId}`, { method: 'POST' });
        if (!response.success) throw new Error(response.error.message);
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const session = await getSession();
        if (!session) throw new Error('No session found');
        const url = urlcat(`/api/twitter/homeTimeline`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<ResponseJSON<TweetV2PaginableTimelineResult>>(url);
        if (!response.success) throw new Error(response.error.message);
        return formatTwitterPostFromFirefly(response.data, 'Post', indicator);
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

    async getProfileById(profileId: string): Promise<Profile> {
        const response = await fetchJSON<ResponseJSON<UserV2>>(`/api/twitter/user/${profileId}`);
        if (!response.success) throw new Error(response.error.message);
        return formatTwitterProfileFromFirefly(response.data);
    }

    async getProfileByHandle(handle: string): Promise<Profile> {
        const response = await fetchJSON<ResponseJSON<UserV2>>(`/api/twitter/username/${handle}`);
        if (!response.success) throw new Error(response.error.message);
        return formatTwitterProfileFromFirefly(response.data);
    }

    getCollectedPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const session = await getSession();
        if (!session) throw new Error('No session found');
        const url = urlcat(`/api/twitter/userTimeline/${profileId}`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<ResponseJSON<TweetV2PaginableTimelineResult>>(url);
        if (!response.success) throw new Error(response.error.message);
        return formatTwitterPostFromFirefly(response.data, 'Post', indicator);
    }

    async getLikedPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const session = await getSession();
        if (!session) throw new Error('No session found');
        const url = urlcat(`/api/twitter/userTimeline/${profileId}/liked`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<ResponseJSON<TweetV2PaginableTimelineResult>>(url);
        if (!response.success) throw new Error(response.error.message);
        const postWithPageable = formatTwitterPostFromFirefly(response.data, 'Post', indicator);
        return { ...postWithPageable, data: postWithPageable.data.map((post) => ({ ...post, hasLiked: true })) };
    }

    async getRepliesPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const session = await getSession();
        if (!session) throw new Error('No session found');
        const url = urlcat(`/api/twitter/userTimeline/${profileId}/replies`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await fetchJSON<ResponseJSON<TweetV2PaginableTimelineResult>>(url);
        if (!response.success) throw new Error(response.error.message);
        return formatTwitterPostFromFirefly(response.data, 'Post', indicator);
    }

    getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getThreadByPostId(postId: string): Promise<Post[]> {
        throw new Error('Not implemented');
    }

    async upvotePost(postId: string): Promise<void> {
        const response = await fetchJSON<ResponseJSON<void>>(`/api/twitter/like/${postId}`, { method: 'POST' });
        if (!response.success) throw new Error(response.error.message);
    }

    async unvotePost(postId: string): Promise<void> {
        const response = await fetchJSON<ResponseJSON<void>>(`/api/twitter/unlike/${postId}`, { method: 'POST' });
        if (!response.success) throw new Error(response.error.message);
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
            source: Source.Twitter,
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

    async deletePost(tweetId: string): Promise<boolean> {
        const response = await fetchJSON<
            ResponseJSON<{
                deleted: boolean;
            }>
        >(`/api/twitter/${tweetId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.success) throw new Error(t`Failed to publish post.`);
        return response.data.deleted;
    }
    async reportUser(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async reportPost(post: Post): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async blockUser(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }
    async getRepostReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }
    async getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }
}

export const TwitterSocialMediaProvider = new TwitterSocialMedia();
