import { t } from '@lingui/macro';
import { isServer } from '@tanstack/react-query';
import { compact } from 'lodash-es';
import type {
    SpaceV2SingleResult,
    TweetV2PaginableTimelineResult,
    Tweetv2TimelineResult,
    UserV2,
    UserV2MuteResult,
    UserV2TimelineResult,
} from 'twitter-api-v2';
import urlcat from 'urlcat';

import { FireflyPlatform, Source, SourceInURL } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { AddLikeStatusToTwitterPosts } from '@/decorators/AddLikeStatusToTwitterPosts.js';
import { SetQueryDataForActPost } from '@/decorators/SetQueryDataForActPost.js';
import { SetQueryDataForBlockProfile } from '@/decorators/SetQueryDataForBlockProfile.js';
import { SetQueryDataForBookmarkPost } from '@/decorators/SetQueryDataForBookmarkPost.js';
import { SetQueryDataForCommentPost } from '@/decorators/SetQueryDataForCommentPost.js';
import { SetQueryDataForDeletePost } from '@/decorators/SetQueryDataForDeletePost.js';
import { SetQueryDataForFollowProfile } from '@/decorators/SetQueryDataForFollowProfile.js';
import { SetQueryDataForLikePost } from '@/decorators/SetQueryDataForLikePost.js';
import { SetQueryDataForMirrorPost } from '@/decorators/SetQueryDataForMirrorPost.js';
import { formatTweetsPage } from '@/helpers/formatTwitterPost.js';
import { formatTwitterProfile, formatTwitterProfilePage } from '@/helpers/formatTwitterProfile.js';
import { getTwitterProfileHandleFromUrl } from '@/helpers/getTwitterProfileHandleFromUrl.js';
import { createIndicator, createPageable, type Pageable, type PageIndicator } from '@/helpers/pageable.js';
import { resolveProfileUrl } from '@/helpers/resolveProfileUrl.js';
import { resolveTCOLink } from '@/helpers/resolveTCOLink.js';
import { resolveTwitterReplyRestriction } from '@/helpers/resolveTwitterReplyRestriction.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { TwitterSession } from '@/providers/twitter/Session.js';
import { twitterSessionHolder } from '@/providers/twitter/SessionHolder.js';
import type { SessionPayload } from '@/providers/twitter/SessionPayload.js';
import { TwitterUserInfoProfileImageShape, TwitterUserInfoVerifiedType } from '@/providers/types/Firefly.js';
import {
    type Channel,
    type Friendship,
    type Notification,
    type Post,
    type Profile,
    type ProfileBadge,
    ProfileBadgePresetColors,
    type ProfileEditable,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import { useTwitterLikeStore } from '@/store/useTwitterLikeStore.js';
import type { ResponseJSON } from '@/types/index.js';

@SetQueryDataForLikePost(Source.Twitter)
@SetQueryDataForBookmarkPost(Source.Twitter)
@SetQueryDataForMirrorPost(Source.Twitter)
@SetQueryDataForCommentPost(Source.Twitter)
@SetQueryDataForDeletePost(Source.Twitter)
@SetQueryDataForFollowProfile(Source.Twitter)
@SetQueryDataForBlockProfile(Source.Twitter)
@SetQueryDataForActPost(Source.Twitter)
@AddLikeStatusToTwitterPosts()
class TwitterSocialMedia implements Provider {
    get type() {
        return SessionType.Twitter;
    }

    getFriendship(profileId: string): Promise<Friendship | null> {
        throw new NotImplementedError();
    }

    blockChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unblockChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getBlockedChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    commentPost(postId: string, post: Post): Promise<string> {
        throw new NotImplementedError();
    }

    collectPost(postId: string, collectionId?: string): Promise<void> {
        throw new NotImplementedError();
    }

    getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new NotImplementedError();
    }

    getHiddenComments(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    actPost(postId: string, options: unknown): Promise<void> {
        throw new NotImplementedError();
    }

    getPostsBeMentioned(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsLiked(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsReplies(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new NotImplementedError();
    }

    getMutualFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    isFollowedByMe(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    isFollowingMe(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    discoverPostsById(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        throw new NotImplementedError();
    }

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return twitterSessionHolder.withSession(async (session) => {
            if (!session) return createPageable([] as Profile[], createIndicator(indicator));
            const url = urlcat(`/api/twitter/user/search`, {
                limit: 25,
                cursor: indicator?.id,
                query: q,
            });
            const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2TimelineResult>>(
                url,
                {},
                {
                    withSession: true,
                },
            );
            if (!response.success) throw new Error(response.error.message);
            return formatTwitterProfilePage(response.data, indicator);
        });
    }

    getChannelTrendingPosts(channel: Channel, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getChannelById(channelId: string): Promise<Channel> {
        throw new NotImplementedError();
    }

    getChannelByHandle(channelHandle: string): Promise<Channel> {
        throw new NotImplementedError();
    }

    getChannelsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsByChannelId(channelId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsByChannelHandle(channelHandle: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    searchChannels(q: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        throw new NotImplementedError();
    }

    getLikeReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }
    getRepostReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }
    getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

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

    async getProfilesByIds(ids: string[]): Promise<Profile[]> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2[]>>('/api/twitter/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids,
            }),
        });
        if (!response.success) throw new Error(response.error.message);
        if (!response.data?.length) return EMPTY_LIST;

        return response.data.map(formatTwitterProfile);
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
        const url = urlcat(`/api/twitter/home`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(
            url,
            {},
            {
                withSession: true,
            },
        );
        if (!response.success) throw new Error(response.error.message);
        return formatTweetsPage(response.data, indicator);
    }

    async getPostById(postId: string): Promise<Post> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<Post>>(`/api/twitter/${postId}`);
        if (!response.success) throw new Error(response.error.message);
        return response.data;
    }

    async getProfileById(profileId: string): Promise<Profile> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2>>(`/api/twitter/user/${profileId}`);
        if (!response.success) throw new Error(response.error.message);
        response.data.url =
            response.data.url && !isServer
                ? ((await resolveTCOLink(response.data.url)) ?? response.data.url)
                : response.data.url;
        return formatTwitterProfile(response.data);
    }

    async getProfileByIdWithSessionPayload(profileId: string, payload: SessionPayload): Promise<Profile> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2>>(`/api/twitter/user/${profileId}`, {
            headers: TwitterSession.payloadToHeaders(payload),
        });
        if (!response.success) throw new Error(response.error.message);
        response.data.url =
            response.data.url && !isServer
                ? ((await resolveTCOLink(response.data.url)) ?? response.data.url)
                : response.data.url;
        return formatTwitterProfile(response.data);
    }

    async getProfileByHandle(handle: string): Promise<Profile> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<UserV2>>(`/api/twitter/username/${handle}`);
        if (!response.success) throw new Error(response.error.message);
        response.data.url =
            response.data.url && !isServer
                ? ((await resolveTCOLink(response.data.url)) ?? response.data.url)
                : response.data.url;
        return formatTwitterProfile(response.data);
    }

    getCollectedPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(`/api/twitter/userTimeline/${profileId}`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(
            url,
            {},
            {
                withSession: true,
            },
        );
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
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(
            url,
            {},
            {
                withSession: true,
            },
        );
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
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(
            url,
            {},
            {
                withSession: true,
            },
        );
        if (!response.success) throw new Error(response.error.message);
        return formatTweetsPage(response.data, indicator);
    }

    async getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const url = urlcat(`/api/twitter/${postId}/comments`, {
            limit: 25,
            cursor: indicator?.id,
        });
        const response = await twitterSessionHolder.fetch<ResponseJSON<TweetV2PaginableTimelineResult>>(
            url,
            {},
            {
                withSession: true,
            },
        );
        if (!response.success) throw new Error(response.error.message);
        return formatTweetsPage(response.data, indicator);
    }

    async getThreadByPostId(postId: string): Promise<Post[]> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<Post[]>>(
            `/api/twitter/threadTweets/${postId}`,
            {},
            {
                withSession: true,
            },
        );
        if (!response.success) throw new Error(response.error.message);
        return response.data;
    }

    async upvotePost(postId: string): Promise<void> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<void>>(`/api/twitter/like/${postId}`, {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);
        const session = twitterSessionHolder.session;
        if (session?.profileId) {
            useTwitterLikeStore.getState().like(session.profileId, postId);
        }
    }

    async unvotePost(postId: string): Promise<void> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<void>>(`/api/twitter/unlike/${postId}`, {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);
        const session = twitterSessionHolder.session;
        if (session?.profileId) {
            useTwitterLikeStore.getState().unlike(session.profileId, postId);
        }
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return twitterSessionHolder.withSession(async (session) => {
            if (!session) return createPageable([] as Post[], createIndicator(indicator));
            const url = urlcat(`/api/twitter/search/all`, {
                limit: 25,
                cursor: indicator?.id,
                query: q,
            });
            const response = await twitterSessionHolder.fetch<ResponseJSON<Tweetv2TimelineResult>>(
                url,
                {},
                {
                    withSession: true,
                },
            );
            if (!response.success) throw new Error(response.error.message);
            return formatTweetsPage(response.data, indicator);
        });
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

    async publishPost(
        post: Post,
        options: {
            excludeReplyProfileIds?: string[];
        } = {},
    ): Promise<string> {
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
                ...options,
                inReplyToTweetId: post.parentPostId,
                replySettings: post.restriction ? resolveTwitterReplyRestriction(post.restriction) : undefined,
                text: post.metadata.content?.content ?? '',
                mediaIds: compact(post.mediaObjects?.map((x) => x.id)),
                poll: post.poll
                    ? {
                          options: post.poll.options.map((option) => ({ label: option.label })),
                          durationSeconds: post.poll.durationSeconds,
                      }
                    : undefined,
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
        const result = await FireflyEndpointProvider.blockProfileFor(FireflyPlatform.Twitter, profileId);
        await runInSafeAsync(() =>
            twitterSessionHolder.fetch<ResponseJSON<UserV2MuteResult['data']>>(
                `/api/twitter/mute/${profileId}`,
                {
                    method: 'POST',
                },
                {
                    withSession: true,
                },
            ),
        );
        return result;
    }
    async unblockProfile(profileId: string): Promise<boolean> {
        const result = await FireflyEndpointProvider.unblockProfileFor(FireflyPlatform.Twitter, profileId);
        await runInSafeAsync(() =>
            twitterSessionHolder.fetch<ResponseJSON<UserV2MuteResult['data']>>(
                `/api/twitter/mute/${profileId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                {
                    withSession: true,
                },
            ),
        );
        return result;
    }
    async getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return FireflySocialMediaProvider.getBlockedProfiles(indicator, SourceInURL.Twitter);
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
        throw new NotImplementedError();
    }
    async reportPost(post: Post): Promise<boolean> {
        throw new NotImplementedError();
    }
    async uploadProfileAvatar(file: File) {
        const formData = new FormData();
        formData.set('file', file);
        const res = await twitterSessionHolder.fetch<ResponseJSON<{ pfp: string }>>('/api/twitter/me/avatar', {
            method: 'PUT',
            body: formData,
        });
        if (!res.success) throw new Error(t`Failed to avatar.`);
        return res.data.pfp;
    }
    async updateProfile(profile: ProfileEditable): Promise<boolean> {
        const res = await twitterSessionHolder.fetch<ResponseJSON<{}>>('/api/twitter/me', {
            method: 'PUT',
            body: JSON.stringify({
                name: profile.displayName,
                description: profile.bio,
                location: profile.location,
                url: profile.website,
            }),
        });
        if (!res.success) throw new Error(res.error.message);
        return true;
    }

    async getProfileBadges(profile: Profile): Promise<ProfileBadge[]> {
        const response = await FireflyEndpointProvider.getTwitterUserInfo(profile.handle);
        const userInfo = response.data.user.result;
        if (!userInfo.is_blue_verified) return [];
        let color =
            userInfo.profile_image_shape === TwitterUserInfoProfileImageShape.Square
                ? ProfileBadgePresetColors.TwitterGold
                : ProfileBadgePresetColors.TwitterBlue;
        if (userInfo.legacy.verified_type === TwitterUserInfoVerifiedType.Government)
            color = ProfileBadgePresetColors.TwitterGray;
        const handle = userInfo.affiliates_highlighted_label.label
            ? getTwitterProfileHandleFromUrl(userInfo.affiliates_highlighted_label.label.url.url)
            : undefined;
        const badgeTargetProfile = handle ? await this.getProfileByHandle(handle).catch(() => undefined) : undefined;
        const href = badgeTargetProfile?.profileId
            ? resolveProfileUrl(Source.Twitter, badgeTargetProfile.profileId)
            : undefined;
        return compact([
            {
                source: Source.Twitter,
                color,
            },
            userInfo.affiliates_highlighted_label.label?.badge.url
                ? {
                      source: Source.Twitter,
                      icon: userInfo.affiliates_highlighted_label.label.badge.url,
                      href,
                  }
                : null,
        ]);
    }

    async getSpace(id: string) {
        const response = await twitterSessionHolder.fetch<ResponseJSON<SpaceV2SingleResult>>(
            urlcat('/api/twitter/space/:id', { id }),
        );
        if (!response.success) throw new Error(t`Failed to fetch space "${id}".`);
        return response.data;
    }

    async joinChannel(channel: Channel): Promise<boolean> {
        throw new NotImplementedError();
    }

    async leaveChannel(channel: Channel): Promise<boolean> {
        throw new NotImplementedError();
    }

    async getPinnedPost(profileId: string): Promise<Post> {
        const response = await twitterSessionHolder.fetch<ResponseJSON<Post>>(`/api/twitter/user/${profileId}/pinned`);
        if (!response.success) throw new Error(response.error.message);
        return response.data;
    }

    async decryptPost(post: Post): Promise<Post> {
        throw new NotImplementedError();
    }
}

export const TwitterSocialMediaProvider = new TwitterSocialMedia();
