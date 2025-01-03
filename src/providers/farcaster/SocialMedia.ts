import { UserDataType } from '@farcaster/core';
import { t } from '@lingui/macro';
import { uniq } from 'lodash-es';

import { BookmarkType, FireflyPlatform, Source, SourceInURL } from '@/constants/enum.js';
import { NotImplementedError } from '@/constants/error.js';
import { SetQueryDataForActPost } from '@/decorators/SetQueryDataForActPost.js';
import { SetQueryDataForBlockChannel } from '@/decorators/SetQueryDataForBlockChannel.js';
import { SetQueryDataForBlockProfile } from '@/decorators/SetQueryDataForBlockProfile.js';
import { SetQueryDataForBookmarkPost } from '@/decorators/SetQueryDataForBookmarkPost.js';
import { SetQueryDataForCommentPost } from '@/decorators/SetQueryDataForCommentPost.js';
import { SetQueryDataForDeletePost } from '@/decorators/SetQueryDataForDeletePost.js';
import { SetQueryDataForFollowProfile } from '@/decorators/SetQueryDataForFollowProfile.js';
import { SetQueryDataForLikePost } from '@/decorators/SetQueryDataForLikePost.js';
import { SetQueryDataForMirrorPost } from '@/decorators/SetQueryDataForMirrorPost.js';
import { SetQueryDataForPosts } from '@/decorators/SetQueryDataForPosts.js';
import { getFarcasterSessionType } from '@/helpers/getFarcasterSessionType.js';
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type Pageable,
    type PageIndicator,
} from '@/helpers/pageable.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import { NeynarSocialMediaProvider } from '@/providers/neynar/SocialMedia.js';
import { FarcasterOpenRankProvider } from '@/providers/openrank/Farcaster.js';
import {
    type Channel,
    type Friendship,
    type Notification,
    type Post,
    type Profile,
    type ProfileBadge,
    type ProfileEditable,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

@SetQueryDataForLikePost(Source.Farcaster)
@SetQueryDataForBookmarkPost(Source.Farcaster)
@SetQueryDataForBookmarkPost(Source.Article)
@SetQueryDataForBookmarkPost(Source.DAOs)
@SetQueryDataForMirrorPost(Source.Farcaster)
@SetQueryDataForCommentPost(Source.Farcaster)
@SetQueryDataForDeletePost(Source.Farcaster)
@SetQueryDataForBlockProfile(Source.Farcaster)
@SetQueryDataForFollowProfile(Source.Farcaster)
@SetQueryDataForBlockChannel(Source.Farcaster)
@SetQueryDataForActPost(Source.Farcaster)
@SetQueryDataForPosts
class FarcasterSocialMedia implements Provider {
    quotePost(postId: string, post: Post, profileId?: string): Promise<string> {
        return HubbleSocialMediaProvider.quotePost(postId, post, profileId);
    }

    commentPost(postId: string, post: Post): Promise<string> {
        return HubbleSocialMediaProvider.commentPost(postId, post);
    }

    collectPost(postId: string, collectionId?: string): Promise<void> {
        throw new NotImplementedError();
    }

    getFriendship(profileId: string): Promise<Friendship | null> {
        throw new NotImplementedError();
    }

    getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new NotImplementedError();
    }

    getProfilesByIds(ids: string[]): Promise<Profile[]> {
        throw new NotImplementedError();
    }

    getProfileByHandle(handle: string): Promise<Profile> {
        return FireflySocialMediaProvider.getProfileByHandle(handle);
    }

    getReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    actPost(postId: string, options: unknown): Promise<void> {
        throw new NotImplementedError();
    }

    getChannelById(channelId: string): Promise<Channel> {
        return FireflySocialMediaProvider.getChannelByHandle(channelId);
    }

    getChannelByHandle(channelHandle: string): Promise<Channel> {
        return FireflySocialMediaProvider.getChannelByHandle(channelHandle);
    }

    getChannelsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        return FireflySocialMediaProvider.getChannelsByProfileId(profileId);
    }

    discoverChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        return FireflySocialMediaProvider.discoverChannels(indicator);
    }

    getPostsByChannelId(channelId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.getPostsByChannelHandle(channelId, indicator);
    }

    getPostsByChannelHandle(channelHandle: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.getPostsByChannelHandle(channelHandle, indicator);
    }

    searchChannels(q: string, indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        return FireflySocialMediaProvider.searchChannels(q, indicator);
    }

    getChannelTrendingPosts(channel: Channel, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.getChannelTrendingPosts(channel, indicator);
    }

    get type() {
        return SessionType.Farcaster;
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.discoverPosts(indicator);
    }

    async discoverPostsById(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.discoverPostsById(profileId, indicator);
        return FireflySocialMediaProvider.discoverPostsById(profileId, indicator);
    }

    async getCollectedPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        return this.getPostsByProfileId(profileId, indicator);
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostsByProfileId(profileId, indicator);
        return FireflySocialMediaProvider.getPostsByProfileId(profileId, indicator);
    }

    async getLikedPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.getLikedPostsByProfileId(profileId, indicator);
    }

    async getRepliesPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.getRepliesPostsByProfileId(profileId, indicator);
    }

    async getPostById(postId: string): Promise<Post> {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostById(postId);
        return FireflySocialMediaProvider.getPostById(postId);
    }

    async getProfileById(profileId: string) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getProfileById(profileId);
        return FireflySocialMediaProvider.getProfileById(profileId);
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getLikeReactors(postId, indicator);
        return FireflySocialMediaProvider.getLikeReactors(postId, indicator);
    }

    async getRepostReactors(postId: string, indicator?: PageIndicator) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getRepostReactors(postId, indicator);
        return FireflySocialMediaProvider.getRepostReactors(postId, indicator);
    }

    async isFollowedByMe(profileId: string) {
        return WarpcastSocialMediaProvider.isFollowedByMe(profileId);
    }

    async isFollowingMe(profileId: string) {
        return WarpcastSocialMediaProvider.isFollowingMe(profileId);
    }

    async getPostsByParentPostId(
        parentPostId: string,
        indicator?: PageIndicator,
        username?: string,
    ): Promise<Pageable<Post, PageIndicator>> {
        if (!username) throw new Error(t`Username is required.`);
        return WarpcastSocialMediaProvider.getPostsByParentPostId(parentPostId, indicator, username);
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getFollowers(profileId, indicator);
        return FireflySocialMediaProvider.getFollowers(profileId, indicator);
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getFollowings(profileId, indicator);
        return FireflySocialMediaProvider.getFollowings(profileId, indicator);
    }

    async getMutualFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return FireflySocialMediaProvider.getMutualFollowers(profileId, indicator);
    }

    async getPostsLiked(profileId: string, indicator?: PageIndicator) {
        return WarpcastSocialMediaProvider.getPostsLiked(profileId, indicator);
    }

    async getPostsReplies(profileId: string, indicator?: PageIndicator) {
        return WarpcastSocialMediaProvider.getPostsReplies(profileId, indicator);
    }

    async getPostsBeMentioned(profileId: string, indicator?: PageIndicator) {
        return WarpcastSocialMediaProvider.getPostsBeMentioned(profileId, indicator);
    }

    async publishPost(post: Post): Promise<string> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.publishPost(post);
        if (isGrantByPermission) return HubbleSocialMediaProvider.publishPost(post);
        throw new Error('No session found.');
    }

    async deletePost(postId: string): Promise<boolean> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.deletePost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.deletePost(postId);
        throw new Error('No session found.');
    }

    async upvotePost(postId: string, authorId?: number) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.upvotePost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.upvotePost(postId, authorId);
        throw new Error('No session found.');
    }

    async unvotePost(postId: string, authorId?: number) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unvotePost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unvotePost(postId, authorId);
        throw new Error('No session found.');
    }

    async mirrorPost(postId: string, options?: { authorId?: number }) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.mirrorPost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.mirrorPost(postId, options);
        throw new Error('No session found.');
    }

    async unmirrorPost(postId: string, authorId?: number) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unmirrorPost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unmirrorPost(postId, authorId);
        throw new Error('No session found.');
    }

    async follow(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.follow(profileId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.follow(profileId);
        throw new Error('No session found.');
    }

    async unfollow(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unfollow(profileId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unfollow(profileId);
        throw new Error('No session found.');
    }

    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return FireflySocialMediaProvider.searchProfiles(q, indicator);
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.searchPosts(q, indicator);
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        const response = await FireflyEndpointProvider.getFarcasterSuggestFollows(indicator);
        // get full profiles
        response.data = await NeynarSocialMediaProvider.getProfilesByIds(
            response.data.map((profile) => `${profile.profileId}`),
        );
        return response;
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getNotifications(indicator);
        if (isGrantByPermission) return FireflySocialMediaProvider.getNotifications(indicator);
        throw new Error('No session found.');
    }

    async getThreadByPostId(postId: string, localPost?: Post) {
        return FireflySocialMediaProvider.getThreadByPostId(postId, localPost);
    }

    getCommentsById(postId: string, indicator?: PageIndicator) {
        return FireflySocialMediaProvider.getCommentsById(postId, indicator);
    }

    async reportProfile(profileId: string) {
        return FireflyEndpointProvider.reportProfile(profileId);
    }

    async reportPost(post: Post) {
        return FireflySocialMediaProvider.reportPost(post);
    }

    async blockProfile(profileId: string) {
        return FireflyEndpointProvider.blockProfileFor(FireflyPlatform.Farcaster, profileId);
    }

    async unblockProfile(profileId: string) {
        return FireflyEndpointProvider.unblockProfileFor(FireflyPlatform.Farcaster, profileId);
    }

    async getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return FireflySocialMediaProvider.getBlockedProfiles(indicator, SourceInURL.Farcaster);
    }

    async blockChannel(channelId: string): Promise<boolean> {
        return FireflySocialMediaProvider.blockChannel(channelId);
    }

    async unblockChannel(channelId: string): Promise<boolean> {
        return FireflySocialMediaProvider.unblockChannel(channelId);
    }

    async getBlockedChannels(indicator?: PageIndicator): Promise<Pageable<Channel, PageIndicator>> {
        return FireflySocialMediaProvider.getBlockedChannels(indicator);
    }

    async getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.getPostsQuoteOn(postId, indicator);
    }
    async bookmark(
        postId: string,
        platform?: FireflyPlatform,
        profileId?: string,
        postType?: BookmarkType,
    ): Promise<boolean> {
        return FireflySocialMediaProvider.bookmark(postId, platform, profileId, postType);
    }
    async unbookmark(postId: string): Promise<boolean> {
        return FireflySocialMediaProvider.unbookmark(postId);
    }
    async getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.getBookmarks(indicator);
    }
    async getForYouPosts(indicator?: PageIndicator) {
        const offset = parseInt(indicator?.id ?? '0', 10) || 0;
        const limit = 50;
        const result = await FarcasterOpenRankProvider.forYouByAuthorship({ offset, limit });
        const postIds = uniq(result.map((x) => x.cast_hash));
        const getAllPostsResult = await Promise.allSettled(postIds.map((id) => this.getPostById(id))); // TODO: replace to multiple queries
        const posts = getAllPostsResult.filter((x) => x.status === 'fulfilled').map((x) => x.value);
        return createPageable(posts, createIndicator(indicator), createNextIndicator(indicator, `${offset + limit}`));
    }
    async updateProfile(profile: ProfileEditable): Promise<boolean> {
        await Promise.all([
            typeof profile.displayName === 'string'
                ? HubbleSocialMediaProvider.userDataAdd(UserDataType.DISPLAY, profile.displayName)
                : null,
            typeof profile.bio === 'string'
                ? HubbleSocialMediaProvider.userDataAdd(UserDataType.BIO, profile.bio)
                : null,
            profile.pfp ? HubbleSocialMediaProvider.userDataAdd(UserDataType.PFP, profile.pfp) : null,
            typeof profile.website === 'string'
                ? HubbleSocialMediaProvider.userDataAdd(UserDataType.URL, profile.website)
                : null,
        ]);
        return true;
    }
    async findLocation(query: string) {
        return WarpcastSocialMediaProvider.findLocation(query);
    }

    async getHiddenComments(postId: string, indicator?: PageIndicator) {
        return FireflySocialMediaProvider.getHiddenComments(postId, indicator);
    }

    async getProfileBadges(profile: Profile): Promise<ProfileBadge[]> {
        return profile.isPowerUser
            ? [
                  {
                      source: Source.Farcaster,
                  },
              ]
            : [];
    }

    async joinChannel(channel: Channel): Promise<boolean> {
        throw new NotImplementedError();
    }

    async leaveChannel(channel: Channel): Promise<boolean> {
        throw new NotImplementedError();
    }

    async getPinnedPost(profileId: string): Promise<Post> {
        throw new NotImplementedError();
    }

    async decryptPost(post: Post): Promise<Post> {
        throw new NotImplementedError();
    }
}

export const FarcasterSocialMediaProvider = new FarcasterSocialMedia();
