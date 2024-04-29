import { t } from '@lingui/macro';
import { createIndicator, createPageable, EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { attemptUntil } from '@masknet/web3-shared-base';

import { SocialPlatform } from '@/constants/enum.js';
import { SetQueryDataForCommentPost } from '@/decorators/SetQueryDataForCommentPost.js';
import { SetQueryDataForLikePost } from '@/decorators/SetQueryDataForLikePost.js';
import { SetQueryDataForMirrorPost } from '@/decorators/SetQueryDataForMirrorPost.js';
import { SetQueryDataForPosts } from '@/decorators/SetQueryDataForPosts.js';
import { getFarcasterSessionType } from '@/helpers/getFarcasterSessionType.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import {
    type Channel,
    type Notification,
    type Post,
    type Profile,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

@SetQueryDataForLikePost(SocialPlatform.Farcaster)
@SetQueryDataForMirrorPost(SocialPlatform.Farcaster)
@SetQueryDataForCommentPost(SocialPlatform.Farcaster)
@SetQueryDataForPosts
class FarcasterSocialMedia implements Provider {
    quotePost(postId: string, post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    commentPost(postId: string, post: Post): Promise<string> {
        return HubbleSocialMediaProvider.commentPost(postId, post);
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

    getProfileByHandle(handle: string): Promise<Profile> {
        throw new Error('Method not implemented.');
    }

    getReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
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

    async getReplesPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        return FireflySocialMediaProvider.getReplesPostsByProfileId(profileId, indicator);
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

    async getMirrorReactors(postId: string, indicator?: PageIndicator) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getMirrorReactors(postId, indicator);
        return FireflySocialMediaProvider.getMirrorReactors(postId, indicator);
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
        throw new Error(t`No session found.`);
    }

    async upvotePost(postId: string, authorId?: number) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.upvotePost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.upvotePost(postId, authorId);
        throw new Error(t`No session found.`);
    }

    async unvotePost(postId: string, authorId?: number) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unvotePost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unvotePost(postId, authorId);
        throw new Error(t`No session found.`);
    }

    async mirrorPost(postId: string, options?: { authorId?: number }) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.mirrorPost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.mirrorPost(postId, options);
        throw new Error(t`No session found.`);
    }

    async unmirrorPost(postId: string, authorId?: number) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unmirrorPost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unmirrorPost(postId, authorId);
        throw new Error(t`No session found.`);
    }

    async follow(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.follow(profileId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.follow(profileId);
        throw new Error(t`No session found.`);
    }

    async unfollow(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unfollow(profileId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unfollow(profileId);
        throw new Error(t`No session found.`);
    }

    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return FireflySocialMediaProvider.searchProfiles(q, indicator);
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return attemptUntil<Pageable<Post, PageIndicator>>(
            [
                async () => WarpcastSocialMediaProvider.searchPosts(q, indicator),
                async () => FireflySocialMediaProvider.searchPosts(q, indicator),
            ],
            createPageable<Post>(EMPTY_LIST, createIndicator(indicator)),
        );
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        return WarpcastSocialMediaProvider.getSuggestedFollows(indicator);
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getNotifications(indicator);
        if (isGrantByPermission) return FireflySocialMediaProvider.getNotifications(indicator);
        throw new Error(t`No session found.`);
    }

    async getThreadByPostId(postId: string, localPost?: Post) {
        return FireflySocialMediaProvider.getThreadByPostId(postId, localPost);
    }

    getCommentsById(postId: string, indicator?: PageIndicator) {
        return FireflySocialMediaProvider.getCommentsById(postId, indicator);
    }
}

export const FarcasterSocialMediaProvider = new FarcasterSocialMedia();
