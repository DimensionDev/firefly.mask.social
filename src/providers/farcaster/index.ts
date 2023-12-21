import { t } from '@lingui/macro';
import { type Pageable, type PageIndicator } from '@masknet/shared-base';
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
        throw new Error(t`wrong session type`);
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostsByProfileId(profileId, indicator);
        if (isGrantByPermission) return FireflySocialMediaProvider.getPostsByProfileId(profileId, indicator);
        throw new Error(t`wrong session type`);
    }

    async getPostById(postId: string): Promise<Post> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostById(postId);
        if (isGrantByPermission) return FireflySocialMediaProvider.getPostById(postId);
        throw new Error(t`wrong session type`);
    }

    async getProfileById(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getProfileById(profileId);
        if (isGrantByPermission) return FireflySocialMediaProvider.getProfileById(profileId);
        throw new Error(t`wrong session type`);
    }

    async getLikeReactors(postId: string, indicator?: PageIndicator) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getLikeReactors(postId, indicator);
        if (isGrantByPermission) throw new Error('Method not implemented.');
        throw new Error(t`wrong session type`);
    }

    async getMirrorReactors(postId: string, indicator?: PageIndicator) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getMirrorReactors(postId, indicator);
        if (isGrantByPermission) throw new Error('Method not implemented.');
        throw new Error(t`wrong session type`);
    }

    async isFollowedByMe(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.isFollowedByMe(profileId);
        if (isGrantByPermission) throw new Error('Method not implemented.');
        throw new Error(t`wrong session type`);
    }

    async isFollowingMe(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.isFollowingMe(profileId);
        if (isGrantByPermission) throw new Error('Method not implemented.');
        throw new Error(t`wrong session type`);
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
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getFollowers(profileId, indicator);
        if (isGrantByPermission) return FireflySocialMediaProvider.getFollowers(profileId, indicator);
        throw new Error(t`wrong session type`);
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getFollowings(profileId, indicator);
        if (isGrantByPermission) return FireflySocialMediaProvider.getFollowings(profileId, indicator);
        throw new Error(t`wrong session type`);
    }

    async getPostsLiked(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostsLiked(profileId, indicator);
        if (isGrantByPermission) throw new Error('Method not implemented.');
        throw new Error(t`wrong session type`);
    }

    async getPostsReplies(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostsReplies(profileId, indicator);
        if (isGrantByPermission) throw new Error('Method not implemented.');
        throw new Error(t`wrong session type`);
    }

    async getPostsBeMentioned(profileId: string, indicator?: PageIndicator) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getPostsBeMentioned(profileId, indicator);
        if (isGrantByPermission) throw new Error('Method not implemented.');
        throw new Error(t`wrong session type`);
    }

    async publishPost(post: Post): Promise<Post> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.publishPost(post);
        if (isGrantByPermission) return HubbleSocialMediaProvider.publishPost(post);
        throw new Error(t`wrong session type`);
    }

    async upvotePost(postId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.upvotePost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.upvotePost(postId);
        throw new Error(t`wrong session type`);
    }

    async unvotePost(postId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unvotePost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unvotePost(postId);
        throw new Error(t`wrong session type`);
    }

    async commentPost(postId: string, comment: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.commentPost(postId, comment);
        if (isGrantByPermission) return HubbleSocialMediaProvider.commentPost(postId, comment);
        throw new Error(t`wrong session type`);
    }

    async mirrorPost(postId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.mirrorPost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.mirrorPost(postId);
        throw new Error(t`wrong session type`);
    }

    async unmirrorPost(postId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unmirrorPost(postId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unmirrorPost(postId);
        throw new Error(t`wrong session type`);
    }

    async follow(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.follow(profileId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.follow(profileId);
        throw new Error(t`wrong session type`);
    }

    async unfollow(profileId: string) {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.unfollow(profileId);
        if (isGrantByPermission) return HubbleSocialMediaProvider.unfollow(profileId);
        throw new Error(t`wrong session type`);
    }

    async searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        return WarpcastSocialMediaProvider.searchProfiles(q, indicator);
    }

    async searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.searchPosts(q, indicator);
        if (isGrantByPermission) return FireflySocialMediaProvider.searchPosts(q, indicator);
        throw new Error(t`wrong session type`);
    }

    async getSuggestedFollows(indicator?: PageIndicator): Promise<Pageable<Profile>> {
        return WarpcastSocialMediaProvider.getSuggestedFollows(indicator);
    }

    async getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        const { isCustodyWallet, isGrantByPermission } = getFarcasterSessionType();
        if (isCustodyWallet) return WarpcastSocialMediaProvider.getNotifications(indicator);
        if (isGrantByPermission) return FireflySocialMediaProvider.getNotifications(indicator);
        throw new Error(t`wrong session type`);
    }
}

export const FarcasterSocialMediaProvider = new FarcasterSocialMedia();
