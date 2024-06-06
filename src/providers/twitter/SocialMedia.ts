import { t } from '@lingui/macro';
import { createIndicator, createPageable, EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { compact } from 'lodash-es';
import type {
    TweetV2,
    TweetV2PaginableTimelineResult,
    UserV2,
    UserV2MuteResult,
    UserV2TimelineResult,
} from 'twitter-api-v2';
import urlcat from 'urlcat';

import { Source } from '@/constants/enum.js';
import { formatTweetsPage, tweetV2ToPost } from '@/helpers/formatTwitterPost.js';
import { formatTwitterProfile } from '@/helpers/formatTwitterProfile.js';
import { resolveTwitterReplyRestriction } from '@/helpers/resolveTwitterReplyRestriction.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import type { SessionPayload } from '@/providers/twitter/SessionPayload.js';
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
        const response = await twitterSessionHolder.fetch<ResponseJSON<void>>(`/api/twitter/unretweet/${postId}`, {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);
    }

    async mirrorPost(postId: string): Promise<string> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<void>>(`/api/twitter/retweet/${postId}`, {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);
        return postId;
    }

    async blockChannel(channelId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async unblockChannel(channelId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async getBlockedChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new Error('Method not implemented.');
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

    getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
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

    async follow(profileId: string): Promise<boolean> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<void>>(`/api/twitter/follow/${profileId}`, {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);
        return true;
    }

    async unfollow(profileId: string): Promise<boolean> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<void>>(`/api/twitter/unfollow/${profileId}`, {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);
        return true;
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(`/api/twitter/homeTimeline`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(url, {}, true);
        if (!response.success) throw new Error(response.error.message);
        return formatTweetsPage(response.data, indicator);
    }

    discoverPostsById(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        throw new Error('Not implemented');
    }

    async getPostById(postId: string): Promise<Post> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2>>(`/api/twitter/${postId}`);
        if (!response.success) throw new Error(response.error.message);
        const post = tweetV2ToPost(response.data);
        if (response.data.author_id) {
            post.author = await this.getProfileById(response.data.author_id);
        }
        return post;
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2>>(`/api/twitter/user/${profileId}`);
        if (!response.success) throw new Error(response.error.message);
        return formatTwitterProfile(response.data);
    }

    async getProfileByIdWithSessionPayload(profileId: string, payload: SessionPayload): Promise<Profile> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2>>(`/api/twitter/user/${profileId}`, {
            headers: TwitterSession.payloadToHeaders(payload),
        });
        if (!response.success) throw new Error(response.error.message);
        return formatTwitterProfile(response.data);
    }

    async getProfileByHandle(handle: string): Promise<Profile> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2>>(`/api/twitter/username/${handle}`);
        if (!response.success) throw new Error(response.error.message);
        return formatTwitterProfile(response.data);
    }

    getCollectedPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Not implemented');
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(`/api/twitter/userTimeline/${profileId}`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(url, {}, true);
        if (!response.success) throw new Error(response.error.message);
        return formatTweetsPage(response.data, indicator);
    }

    async getLikedPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(`/api/twitter/userTimeline/${profileId}/liked`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(url, {}, true);
        if (!response.success) throw new Error(response.error.message);

        const postWithPageable = formatTweetsPage(response.data, indicator);
        return { ...postWithPageable, data: postWithPageable.data.map((post) => ({ ...post, hasLiked: true })) };
    }

    async getRepliesPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(`/api/twitter/userTimeline/${profileId}/replies`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(url, {}, true);
        if (!response.success) throw new Error(response.error.message);
        return formatTweetsPage(response.data, indicator);
    }

    async getCommentsById(_postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return createPageable(EMPTY_LIST, createIndicator(indicator));
    }

    getThreadByPostId(postId: string): Promise<Post[]> {
        throw new Error('Not implemented');
    }

    async upvotePost(postId: string): Promise<void> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<void>>(`/api/twitter/like/${postId}`, {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);
    }

    async unvotePost(postId: string): Promise<void> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<void>>(`/api/twitter/unlike/${postId}`, {
            method: 'POST',
        });
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

    async login(): Promise<SessionPayload | null> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<SessionPayload>>('/api/twitter/login', {
            method: 'POST',
        });
        if (!response.success) return null;
        return response.data;
    }

    async me(): Promise<Profile> {
        const response = await twitterSessionHolder.fetch<
            ResponseJSON<{
                id: string;
                name: string;
                username: string;
                profile_image_url: string;
            }>
        >('/api/twitter/me');
        if (!response.success) throw new Error('Failed to fetch user profile');

        return {
            profileId: response.data.id,
            displayName: response.data.name,
            handle: response.data.username,
            fullHandle: response.data.username,
            pfp: '',
            followerCount: 0,
            followingCount: 0,
            status: ProfileStatus.Active,
            verified: true,
            source: Source.Twitter,
        };
    }

    async quotePost(postId: string, post: Post): Promise<string> {
        const response = await twitterSessionHolder.fetch<
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
        const response = await twitterSessionHolder.fetch<
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
                poll: post.poll ? {
                    options: post.poll.options.map((option) => ({ label: option.label })),
                    durationSeconds: post.poll.durationSeconds,
                } : null,
            }),
        });

        if (!response.success) throw new Error(t`Failed to publish post.`);
        return response.data.id;
    }

    async deletePost(tweetId: string): Promise<boolean> {
        const response = await twitterSessionHolder.fetch<
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
    async blockProfile(profileId: string): Promise<boolean> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2MuteResult['data']>>(
            `/api/twitter/mute/${profileId}`,
            {
                method: 'POST',
            },
            true,
        );
        if (!response.success) throw new Error(response.error.message);
        return response.data.muting === true;
    }
    async unblockProfile(profileId: string): Promise<boolean> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2MuteResult['data']>>(
            `/api/twitter/mute/${profileId}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            true,
        );
        if (!response.success) throw new Error(response.error.message);
        return response.data.muting === false;
    }
    async getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        const url = urlcat(`/api/twitter/mute`, {
            limit: 20,
            cursor: indicator?.id,
        });
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2TimelineResult>>(url, {}, true);
        if (!response.success) throw new Error(response.error.message);
        const profiles = (response.data.data ?? []).map(formatTwitterProfile);
        return createPageable(
            profiles,
            createIndicator(indicator),
            response.data.meta.next_token ? createIndicator(undefined, response.data.meta.next_token) : undefined,
        );
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
    async bookmark(tweetId: string): Promise<boolean> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<boolean>>(`/api/twitter/bookmark/${tweetId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.success) throw new Error(t`Failed to bookmark post.`);
        return response.data;
    }
    async unbookmark(tweetId: string): Promise<boolean> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<boolean>>(`/api/twitter/bookmark/${tweetId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.success) throw new Error(t`Failed to unbookmark post.`);
        return response.data;
    }
    async getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat('/api/twitter/bookmarks', {
            cursor: indicator?.id || undefined,
            limit: 25,
        });
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(url);
        if (!response.success) throw new Error(t`Failed to fetch bookmarks.`);
        return formatTweetsPage(response.data, indicator);
    }
    async reportProfile(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async reportPost(postId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
}

export const TwitterSocialMediaProvider = new TwitterSocialMedia();
