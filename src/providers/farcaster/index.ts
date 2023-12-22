import { t } from '@lingui/macro';
import { createIndicator, createPageable, EMPTY_LIST, type Pageable, type PageIndicator } from '@masknet/shared-base';
import { attemptUntil } from '@masknet/web3-shared-base';
import { HubRestAPIClient } from '@standard-crypto/farcaster-js';

import { getFarcasterSessionType } from '@/helpers/getFarcasterSessionType.js';
import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import { HubbleSocialMediaProvider } from '@/providers/hubble/SocialMedia.js';
import {
    type Notification,
    type Post,
    type Profile,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import { WarpcastSocialMediaProvider } from '@/providers/warpcast/SocialMedia.js';

export class FarcasterSocialMedia implements Provider {
    get type() {
        return SessionType.Farcaster;
    }

    async createClient() {
        return new HubRestAPIClient();
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        return WarpcastSocialMediaProvider.discoverPosts(indicator);
    }

    async discoverPostsById(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.discoverPostsById(profileId, indicator);
        if (isGrantByPermission) return FireflySocialMediaProvider.discoverPostsById(profileId, indicator);
        throw new Error(t`No session found.`);
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostsByProfileId(profileId, indicator);
        if (isGrantByPermission) return FireflySocialMediaProvider.getPostsByProfileId(profileId, indicator);
        throw new Error(t`No session found.`);
    }

    async getPostById(postId: string): Promise<Post> {
        const { isCustodyWallet, isGrantByPermission, noSession } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostById(postId);
        if (isGrantByPermission || noSession) return FireflySocialMediaProvider.getPostById(postId);
        throw new Error(t`No session found.`);
    }

    async getProfileById(profileId: string) {
        const { isCustodyWallet, isGrantByPermission, noSession } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getProfileById(profileId);
        if (isGrantByPermission || noSession) return FireflySocialMediaProvider.getProfileById(profileId);
        throw new Error(t`No session found.`);
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator) {
        const { isCustodyWallet, isGrantByPermission, noSession } = getFarcasterSessionType();
        if(isCustodyWallet) return WarpcastSocialMediaProvider.getLikeReactors(postId, indicator);
        if(isGrantByPermission || noSession) return FireflySocialMediaProvider.getLikeReactors(postId, indicator)
        throw new Error(t`No session found.`);
    }

    async getMirrorReactors(postId: string, indicator?: PageIndicator) {
        const { isCustodyWallet, isGrantByPermission, noSession } = getFarcasterSessionType();
        if(isCustodyWallet) return WarpcastSocialMediaProvider.getMirrorReactors(postId, indicator);
        if(isGrantByPermission || noSession) return FireflySocialMediaProvider.getMirrorReactors(postId, indicator)
        throw new Error(t`No session found.`);
    }

    async isFollowedByMe(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.isFollowedByMe(profileId);
        if (isGrantByPermission) throw new Error('Method not implemented.');
        throw new Error(t`No session found.`);
    }

    async isFollowingMe(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.isFollowingMe(profileId);
        if (isGrantByPermission) throw new Error('Method not implemented.');
        throw new Error(t`No session found.`);
    }

    // @ts-ignore
    async getPostsByParentPostId(
        parentPostId: string,
        username: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        return WarpcastSocialMediaProvider.getPostsByParentPostId(parentPostId, username, indicator);
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getFollowers(profileId, indicator);
        return FireflySocialMediaProvider.getFollowers(profileId, indicator);
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet} = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getFollowings(profileId, indicator);
        return FireflySocialMediaProvider.getFollowings(profileId, indicator);
    }

    async getPostsLiked(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostsLiked(profileId, indicator);
         throw new Error('Method not implemented.');
    }

    async getPostsReplies(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet} = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostsReplies(profileId, indicator);
        throw new Error('Method not implemented.');
    }

    async getPostsBeMentioned(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostsBeMentioned(profileId, indicator);
        throw new Error('Method not implemented.');
    }

    async publishPost(post: Post): Promise<Post> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.publishPost(post);
        if (isGrantByPermission) return HubbleSocialMediaProvider.publishPost(post);
        throw new Error(t`No session found.`);
    }

    async upvotePost(postId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.upvotePost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.upvotePost(postId);
        throw new Error(t`No session found.`);
    }

    async unvotePost(postId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unvotePost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unvotePost(postId);
        throw new Error(t`No session found.`);
    }

    async commentPost(postId: string, comment: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.commentPost(postId, comment);
        if (isGrantByPermission) return HubbleSocialMediaProvider.commentPost(postId, comment);
        throw new Error(t`No session found.`);
    }

    async mirrorPost(postId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.mirrorPost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.mirrorPost(postId);
        throw new Error(t`No session found.`);
    }

    async unmirrorPost(postId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unmirrorPost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unmirrorPost(postId);
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
        return WarpcastSocialMediaProvider.searchProfiles(q, indicator);
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
}

export const FarcasterSocialMediaProvider = new FarcasterSocialMedia();
