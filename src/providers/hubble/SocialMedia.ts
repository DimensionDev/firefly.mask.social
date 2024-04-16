import { CastAddBody, Factories, Message, MessageType, ReactionType, toFarcasterTime } from '@farcaster/core';
import { t } from '@lingui/macro';
import type { Pageable, PageIndicator } from '@masknet/shared-base';
import { toInteger } from 'lodash-es';
import urlcat from 'urlcat';
import { toBytes } from 'viem';

import { HUBBLE_URL } from '@/constants/index.js';
import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { getAllMentionsForFarcaster } from '@/helpers/getAllMentionsForFarcaster.js';
import type { FrameSignaturePacket, SignaturePacket } from '@/providers/types/Hubble.js';
import {
    type Notification,
    type Post,
    type Profile,
    type Provider,
    SessionType,
} from '@/providers/types/SocialMedia.js';
import { ReactionType as ReactionTypeCustom } from '@/providers/types/SocialMedia.js';
import type { Frame, Index } from '@/types/frame.js';

function fetchHubbleJSON<T>(url: string, options: RequestInit): Promise<T> {
    const headers = {
        'Content-Type': 'application/octet-stream',
        ...options.headers,
    };

    if (process.env.HUBBLE_TOKEN) {
        // @ts-ignore - api_key is not in the type definition
        headers.api_key = process.env.HUBBLE_TOKEN;
    } else if (process.env.NEXT_PUBLIC_HUBBLE_TOKEN) {
        // @ts-ignore - api_key is not in the type definition
        headers.api_key = process.env.NEXT_PUBLIC_HUBBLE_TOKEN;
    }

    return fetchJSON(url, {
        ...options,
        headers,
    });
}

class HubbleSocialMedia implements Provider {
    commentPost(postId: string, post: Post): Promise<string> {
        throw new Error('Method not implemented.');
    }

    getProfileById(profileId: string): Promise<Profile> {
        throw new Error('Method not implemented.');
    }

    getPostById(postId: string): Promise<Post> {
        throw new Error('Method not implemented.');
    }

    getCommentsById(postId: string, indicator?: PageIndicator | undefined): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    discoverPosts(indicator?: PageIndicator | undefined): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    discoverPostsById(
        profileId: string,
        indicator?: PageIndicator | undefined,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByProfileId(
        profileId: string,
        indicator?: PageIndicator | undefined,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsByParentPostId(
        postId: string,
        indicator?: PageIndicator | undefined,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getFollowers(profileId: string, indicator?: PageIndicator | undefined): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getFollowings(profileId: string, indicator?: PageIndicator | undefined): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getNotifications(indicator?: PageIndicator | undefined): Promise<Pageable<Notification, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    searchProfiles(q: string, indicator?: PageIndicator | undefined): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    searchPosts(q: string, indicator?: PageIndicator | undefined): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getThreadByPostId(postId: string): Promise<Post[]> {
        throw new Error('Method not implemented.');
    }

    quotePost(postId: string, post: Post): Promise<string> {
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

    getProfileByHandle(handle: string): Promise<Profile> {
        throw new Error('Method not implemented.');
    }

    getPostsBeMentioned(
        profileId: string,
        indicator?: PageIndicator | undefined,
    ): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsLiked(profileId: string, indicator?: PageIndicator | undefined): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getPostsReplies(profileId: string, indicator?: PageIndicator | undefined): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    getReactors(postId: string, indicator?: PageIndicator | undefined): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    isFollowedByMe(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    isFollowingMe(profileId: string): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    getSuggestedFollows(indicator?: PageIndicator | undefined): Promise<Pageable<Profile, PageIndicator>> {
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
        const { data, hash } = await fetchHubbleJSON<Pick<Message, 'data'> & { hash: string }>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to publish post.`);

        return hash;
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
        const { data } = await fetchHubbleJSON<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to upvote post.`);

        return {
            reactionId: messageDataHash,
            type: ReactionTypeCustom.Upvote,
            timestamp: messageData.timestamp,
        };
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
        const { data } = await fetchHubbleJSON<Message>(url, {
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
        const { data } = await fetchHubbleJSON<Message>(url, {
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
        const { data } = await fetchHubbleJSON<Message>(url, {
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
        const { data } = await fetchHubbleJSON<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to follow.`);
        return null!;
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
        const { data } = await fetchHubbleJSON<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to unfollow.`);
        return null!;
    }

    async validateMessage(messageBytes: string) {
        const url = urlcat(HUBBLE_URL, '/v1/validateMessage');
        const { valid, message } = await fetchHubbleJSON<{ valid: boolean; message: Message }>(url, {
            method: 'POST',
            body: Buffer.from(messageBytes, 'hex'),
        });
        if (valid) return true;
        return false;
    }

    async generateSignaturePacket(): Promise<SignaturePacket> {
        const { signer, messageDataHash, messageDataSignature } = await encodeMessageData(
            () => {
                return {
                    type: MessageType.CAST_ADD,
                    timestamp: toFarcasterTime(Date.now())._unsafeUnwrap(),
                    castAddBody: undefined,
                };
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
        return {
            signer,
            messageHash: messageDataHash,
            messageSignature: messageDataSignature,
        };
    }

    async generateFrameSignaturePacket(
        postId: string,
        frame: Frame,
        index: Index,
        input?: string,
        // the state is not read from frame, for initial frame it should not provide state
        state?: string,
    ): Promise<FrameSignaturePacket> {
        const { messageBytes, messageData, messageDataHash } = await encodeMessageData(
            (fid) => ({
                type: MessageType.FRAME_ACTION,
                frameActionBody: {
                    url: toBytes(frame.url),
                    buttonIndex: index,
                    castId: {
                        fid,
                        hash: toBytes(postId),
                    },
                    inputText: input ? toBytes(input) : new Uint8Array([]),
                    state: state ? toBytes(state) : new Uint8Array([]),
                    transactionId: new Uint8Array([]),
                    address: new Uint8Array([]),
                },
            }),
            async (messageData, signer) => {
                return Factories.FrameActionMessage.create(
                    {
                        data: messageData,
                    },
                    {
                        transient: { signer },
                    },
                );
            },
        );

        const packet = {
            untrustedData: {
                fid: messageData.fid,
                url: frame.url,
                messageHash: messageDataHash,
                timestamp: messageData.timestamp,
                network: messageData.network,
                buttonIndex: index,
                inputText: input,
                state,
                castId: {
                    fid: messageData.fid,
                    hash: postId,
                },
            },
            trustedData: {
                // no 0x prefix
                messageBytes: Buffer.from(messageBytes).toString('hex'),
            },
        };

        if (typeof packet.untrustedData.state === 'undefined') delete packet.untrustedData.state;

        return packet;
    }
}

export const HubbleSocialMediaProvider = new HubbleSocialMedia();
