import { CastAddBody, CastRemoveBody, Factories, Message, ReactionType } from '@farcaster/core';
import { t } from '@lingui/macro';
import type { Pageable, PageIndicator } from '@masknet/shared-base';
import { toInteger } from 'lodash-es';
import urlcat from 'urlcat';
import { toBytes } from 'viem';

import { HUBBLE_URL } from '@/constants/index.js';
import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import { getAllMentionsForFarcaster } from '@/helpers/getAllMentionsForFarcaster.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import {
    type Channel,
    type Notification,
    type Post,
    type Profile,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';

class HubbleSocialMedia implements Provider {
    commentPost(postId: string, post: Post): Promise<string> {
        return this.publishPost(post);
    }

    getProfileById(profileId: string): Promise<Profile> {
        throw new Error('Method not implemented.');
    }

    getPostById(postId: string): Promise<Post> {
        throw new Error('Method not implemented.');
    }

    getCommentsById(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    discoverPostsById(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getLikedPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getRepliesPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getNotifications(indicator?: PageIndicator): Promise<Pageable<Notification, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getThreadByPostId(postId: string): Promise<Post[]> {
        throw new Error('Method not implemented.');
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

        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const { data, hash } = await farcasterSessionHolder.fetchHubble<Pick<Message, 'data'> & { hash: string }>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to quote post.`);
        return hash;
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

    getProfileByHandle(handle: string): Promise<Profile> {
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

    getReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
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
        return SessionType.Farcaster;
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

        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const { data, hash } = await farcasterSessionHolder.fetchHubble<Pick<Message, 'data'> & { hash: string }>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to publish post.`);
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

        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const { data } = await farcasterSessionHolder.fetchHubble<Pick<Message, 'data'> & { hash: string }>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to publish post.`);

        return true;
    }

    async upvotePost(postId: string, authorId?: number) {
        if (!authorId) throw new Error(t`Failed to upvote post.`);

        const { messageBytes, messageDataHash, messageData } = await encodeMessageData(
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

        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const { data } = await farcasterSessionHolder.fetchHubble<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to upvote post.`);
        return;
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

        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const { data } = await farcasterSessionHolder.fetchHubble<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to unvote post.`);
        return;
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

        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const { data } = await farcasterSessionHolder.fetchHubble<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to mirror post.`);

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

        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const { data } = await farcasterSessionHolder.fetchHubble<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to unmirror post.`);
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

        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const { data } = await farcasterSessionHolder.fetchHubble<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to follow.`);
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

        const url = urlcat(HUBBLE_URL, '/v1/submitMessage');
        const { data } = await farcasterSessionHolder.fetchHubble<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to unfollow.`);
        return true;
    }

    async reportProfile(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async reportPost(post: Post): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async blockProfile(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async unblockProfile(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    async getBlockedProfiles(indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
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

    async getLikeReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }
    async getRepostReactors(postId: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostsQuoteOn(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }
    async bookmark(postId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async unbookmark(postId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    async getBookmarks(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }
}

export const HubbleSocialMediaProvider = new HubbleSocialMedia();
