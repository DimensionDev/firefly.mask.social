/* cspell:disable */

import { CastAddBody, CastRemoveBody, Factories, ReactionType, UserDataType } from '@farcaster/core';
import { t } from '@lingui/macro';
import { toInteger } from 'lodash-es';
import urlcat from 'urlcat';
import { toBytes } from 'viem';
import { z } from 'zod';

import { FarcasterInvalidSignerKey, NotImplementedError } from '@/constants/error.js';
import { HUBBLE_URL } from '@/constants/index.js';
import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import { getAllMentionsForFarcaster } from '@/helpers/getAllMentionsForFarcaster.js';
import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import type { WalletProfile } from '@/providers/types/Firefly.js';
import type { Response } from '@/providers/types/Hubble.js';
import {
    type Channel,
    type Friendship,
    NetworkType,
    type Notification,
    type Post,
    type Profile,
    type ProfileBadge,
    type ProfileEditable,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';

const ErrorResponseSchema = z.custom<Response<never>>((response) => {
    const error = response as Response<never>;
    return (
        typeof error.code === 'number' &&
        typeof error.name === 'string' &&
        typeof error.errCode === 'string' &&
        typeof error.details === 'string'
    );
});

class HubbleSocialMedia implements Provider {
    getChannelsByIds(ids: string[]): Promise<Channel[]> {
        throw new NotImplementedError();
    }

    getChannelTrendingPosts(channel: Channel, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    blockWallet(address: string, networkType?: NetworkType): Promise<boolean> {
        throw new NotImplementedError();
    }

    unblockWallet(address: string, networkType?: NetworkType): Promise<boolean> {
        throw new NotImplementedError();
    }

    getBlockedWallets(indicator?: PageIndicator): Promise<Pageable<WalletProfile, PageIndicator>> {
        throw new NotImplementedError();
    }

    watchWallet(address: string, networkType?: NetworkType): Promise<boolean> {
        throw new NotImplementedError();
    }

    unwatchWallet(address: string, networkType?: NetworkType): Promise<boolean> {
        throw new NotImplementedError();
    }

    reportChannel(channelId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getForYouPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getRecentPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getFriendship(profileId: string): Promise<Friendship | null> {
        throw new NotImplementedError();
    }

    commentPost(postId: string, post: Post): Promise<string> {
        return this.publishPost(post);
    }

    getProfileById(profileId: string): Promise<Profile> {
        throw new NotImplementedError();
    }

    getPostById(postId: string): Promise<Post> {
        throw new NotImplementedError();
    }

    getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    discoverPostsById(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getHiddenComments(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    actPost(postId: string, options: unknown): Promise<void> {
        throw new NotImplementedError();
    }

    getLikedPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getRepliesPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    getMutualFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        throw new NotImplementedError();
    }

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    getThreadByPostId(postId: string): Promise<Post[]> {
        throw new NotImplementedError();
    }

    collectPost(postId: string, collectionId?: string): Promise<void> {
        throw new NotImplementedError();
    }

    getProfilesByAddress(address: string): Promise<Profile[]> {
        throw new NotImplementedError();
    }

    getProfilesByIds(ids: string[]): Promise<Profile[]> {
        throw new NotImplementedError();
    }

    getProfileByHandle(handle: string): Promise<Profile> {
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

    getReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
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

    reportProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    reportPost(post: Post): Promise<boolean> {
        throw new NotImplementedError();
    }

    blockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unblockProfile(profileId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
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

    getLikeReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    getRepostReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new NotImplementedError();
    }

    getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    bookmark(postId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    unbookmark(postId: string): Promise<boolean> {
        throw new NotImplementedError();
    }

    getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new NotImplementedError();
    }

    get type() {
        return SessionType.Farcaster;
    }

    private async submitMessage<T>(messageBytes: Buffer) {
        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const response = await farcasterSessionHolder.fetchHubble<Response<T>>(url, {
            method: 'POST',
            body: messageBytes,
        });

        const parsed = ErrorResponseSchema.safeParse(response);

        if (parsed.success) {
            // invalid signer: signer not found for fid
            if (parsed.data.code === 3 && parsed.data.errCode === 'bad_request.validation_failure')
                throw new FarcasterInvalidSignerKey('Invalid signer key.');

            throw new Error(parsed.data.details);
        } else {
            return response as T;
        }
    }

    async quotePost(postId: string, post: Post, profileId?: string): Promise<string> {
        const result = await getAllMentionsForFarcaster(post.metadata.content?.content ?? '');
        if (!postId || !post || !profileId) throw new Error(t`Failed to quote post.`);

        const { messageBytes } = await encodeMessageData(
            () => {
                const data: {
                    castAddBody: CastAddBody;
                } = {
                    castAddBody: {
                        ...result,
                        embedsDeprecated: [],
                        embeds: [
                            {
                                castId: {
                                    fid: toInteger(profileId),
                                    hash: toBytes(postId),
                                },
                            },
                            ...(post.mediaObjects?.map((v) => ({ url: v.url })) ?? []),
                        ],
                        parentCastId: undefined,
                        parentUrl: undefined,
                    },
                };

                if (post.commentOn?.postId && post.commentOn?.author.profileId) {
                    data.castAddBody.parentCastId = {
                        fid: toInteger(post.commentOn.author.profileId),
                        hash: toBytes(post.commentOn.postId),
                    };
                } else if (post.parentChannelUrl) {
                    data.castAddBody.parentUrl = post.parentChannelUrl;
                }
                return data;
            },
            async (messageData, signer) => {
                return Factories.CastAddMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        const { hash } = await this.submitMessage<{ hash: string }>(messageBytes);
        return hash;
    }

    async publishPost(post: Post): Promise<string> {
        const result = await getAllMentionsForFarcaster(post.metadata.content?.content ?? '');
        const { messageBytes } = await encodeMessageData(
            () => {
                const data: {
                    castAddBody: CastAddBody;
                } = {
                    castAddBody: {
                        ...result,
                        embedsDeprecated: [],
                        embeds: post.mediaObjects?.map((v) => ({ url: v.url })) ?? [],
                        parentCastId: undefined,
                        parentUrl: undefined,
                    },
                };

                if (post.commentOn?.postId && post.commentOn?.author.profileId) {
                    data.castAddBody.parentCastId = {
                        fid: toInteger(post.commentOn.author.profileId),
                        hash: toBytes(post.commentOn.postId),
                    };
                } else if (post.parentChannelUrl) {
                    data.castAddBody.parentUrl = post.parentChannelUrl;
                }
                return data;
            },
            async (messageData, signer) => {
                return Factories.CastAddMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        const { hash } = await this.submitMessage<{ hash: string }>(messageBytes);
        return hash;
    }

    async deletePost(postId: string): Promise<boolean> {
        const { messageBytes } = await encodeMessageData(
            () => {
                const data: {
                    castRemoveBody: CastRemoveBody;
                } = {
                    castRemoveBody: {
                        targetHash: toBytes(postId),
                    },
                };

                return data;
            },
            async (messageData, signer) => {
                return Factories.CastRemoveMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        await this.submitMessage(messageBytes);
        return true;
    }

    async upvotePost(postId: string, authorId?: number) {
        if (!authorId) throw new Error(t`Failed to upvote post.`);

        const { messageBytes } = await encodeMessageData(
            (fid) => ({
                reactionBody: {
                    type: ReactionType.LIKE,
                    targetCastId: {
                        fid: authorId,
                        hash: toBytes(postId),
                    },
                },
            }),
            async (messageData, signer) => {
                return Factories.ReactionAddMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        await this.submitMessage(messageBytes);
    }

    async unvotePost(postId: string, authorId?: number) {
        if (!authorId) throw new Error(t`Failed to unvote post.`);

        const { messageBytes } = await encodeMessageData(
            (fid) => ({
                reactionBody: {
                    type: ReactionType.LIKE,
                    targetCastId: {
                        fid: authorId,
                        hash: toBytes(postId),
                    },
                },
            }),
            async (messageData, signer) => {
                return Factories.ReactionRemoveMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        await this.submitMessage(messageBytes);
    }

    async mirrorPost(postId: string, options?: { authorId?: number }) {
        if (!options?.authorId) throw new Error(t`Failed to recast post`);

        const reactionBody = {
            type: ReactionType.RECAST,
            targetCastId: {
                fid: options.authorId,
                hash: toBytes(postId),
            },
        };

        const { messageBytes } = await encodeMessageData(
            (fid) => ({
                reactionBody,
            }),
            async (messageData, signer) => {
                return Factories.ReactionAddMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        await this.submitMessage(messageBytes);

        // FIXME: should return post id here
        return null!;
    }

    async unmirrorPost(postId: string, authorId?: number) {
        if (!authorId) throw new Error(t`Failed to unmirror post.`);

        const { messageBytes } = await encodeMessageData(
            (fid) => ({
                reactionBody: {
                    type: ReactionType.RECAST,
                    targetCastId: {
                        fid: authorId,
                        hash: toBytes(postId),
                    },
                },
            }),
            async (messageData, signer) => {
                return Factories.ReactionRemoveMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        await this.submitMessage(messageBytes);
        return;
    }

    async follow(profileId: string) {
        const { messageBytes } = await encodeMessageData(
            () => ({
                linkBody: {
                    type: 'follow',
                    targetFid: Number(profileId),
                },
            }),
            async (messageData, signer) => {
                return Factories.LinkAddMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        await this.submitMessage(messageBytes);
        return true;
    }

    async unfollow(profileId: string) {
        const { messageBytes } = await encodeMessageData(
            () => ({
                linkBody: {
                    type: 'follow',
                    targetFid: Number(profileId),
                },
            }),
            async (messageData, signer) => {
                return Factories.LinkRemoveMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        await this.submitMessage(messageBytes);
        return true;
    }

    async userDataAdd(type: UserDataType, value: string) {
        const { messageBytes } = await encodeMessageData(
            () => ({
                userDataBody: {
                    type,
                    value,
                },
            }),
            async (messageData, signer) => {
                return Factories.UserDataAddMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );
        await this.submitMessage(messageBytes);
    }

    async updateProfile(profile: ProfileEditable): Promise<boolean> {
        throw new NotImplementedError();
    }

    async getProfileBadges(profile: Profile): Promise<ProfileBadge[]> {
        throw new NotImplementedError();
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

export const HubbleSocialMediaProvider = new HubbleSocialMedia();
