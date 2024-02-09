import { Factories, Message, MessageType, ReactionType } from '@farcaster/core';
import { t } from '@lingui/macro';
import { toInteger } from 'lodash-es';
import urlcat from 'urlcat';
import { toBytes, toHex } from 'viem';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST, HUBBLE_URL } from '@/constants/index.js';
import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { FrameSignaturePacket, SignaturePacket } from '@/providers/types/Hubble.js';
import { type Post, ProfileStatus, type Provider, SessionType } from '@/providers/types/SocialMedia.js';
import { ReactionType as ReactionTypeCustom } from '@/providers/types/SocialMedia.js';
import type { Frame, Index } from '@/types/frame.js';

function fetchHubbleJSON<T>(url: string, options: RequestInit): Promise<T> {
    return fetchJSON(url, {
        ...options,
        headers: {
            'Content-Type': 'application/octet-stream',
            ...options.headers,
        },
    });
}

// @ts-ignore
export class HubbleSocialMedia implements Provider {
    get type() {
        return SessionType.Farcaster;
    }

    async publishPost(post: Post): Promise<Post> {
        const { messageBytes } = await encodeMessageData(
            () => ({
                type: MessageType.CAST_ADD,
                castAddBody: {
                    embedsDeprecated: [],
                    parentCastId: post.commentOn
                        ? {
                              fid: toInteger(post.commentOn.author.profileId),
                              hash: toBytes(post.commentOn.postId),
                          }
                        : undefined,
                    parentUrl: post.parentChannelUrl,
                    mentions: [],
                    text: post.metadata.content?.content ?? '',
                    mentionsPositions: [],
                    embeds: post.mediaObjects?.map((v) => ({ url: v.url })) ?? [],
                },
            }),
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
        const { data, hash } = await fetchHubbleJSON<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to publish post.`);

        return {
            source: SocialPlatform.Farcaster,
            postId: `0x${Buffer.from(hash).toString('hex')}`,
            parentPostId: '',
            timestamp: data.timestamp,
            author: {
                fullHandle: post.author.handle,
                profileId: data.fid.toString(),
                displayName: post.author.displayName,
                handle: post.author.handle,
                pfp: post.author.pfp,
                followerCount: 0,
                followingCount: 0,
                status: ProfileStatus.Active,
                verified: true,
                source: SocialPlatform.Farcaster,
            },
            metadata: {
                locale: '',
                content: {
                    content: data.castAddBody?.text || '',
                },
            },
            stats: {
                comments: 0,
                mirrors: 0,
                quotes: 0,
                reactions: 0,
            },
        };
    }

    async upvotePost(postId: string, authorId?: number) {
        if (!authorId) throw new Error(t`Failed to upvote post.`);

        const { messageBytes, messageHash, messageData } = await encodeMessageData(
            (fid) => ({
                type: MessageType.REACTION_ADD,
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
            reactionId: messageHash,
            type: ReactionTypeCustom.Upvote,
            timestamp: messageData.timestamp,
        };
    }

    async unvotePost(postId: string, authorId?: number) {
        if (!authorId) throw new Error(t`Failed to unvote post.`);

        const { messageBytes } = await encodeMessageData(
            (fid) => ({
                type: MessageType.REACTION_REMOVE,
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
        const { data, hash } = await fetchHubbleJSON<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to unvote post.`);
        return;
    }

    /**
     * @deprecated
     * Use publishPost with parent post instead
     */
    async commentPost(postId: string, comment: string) {
        const { messageBytes } = await encodeMessageData(
            (fid) => ({
                type: MessageType.CAST_ADD,
                castAddBody: {
                    parentCastId: {
                        hash: toBytes(postId),
                        // TODO wrong fid, should be one of the parent cast
                        fid,
                    },
                    embedsDeprecated: EMPTY_LIST,
                    mentions: EMPTY_LIST,
                    text: comment,
                    mentionsPositions: EMPTY_LIST,
                    embeds: EMPTY_LIST,
                },
            }),
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
        const { data, hash } = await fetchHubbleJSON<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to publish post.`);
        return toHex(hash);
    }

    async mirrorPost(postId: string) {
        const { messageBytes } = await encodeMessageData(
            (fid) => ({
                type: MessageType.REACTION_ADD,
                reactionBody: {
                    type: ReactionType.RECAST,
                    targetCastId: {
                        hash: toBytes(postId),
                        fid,
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
        const { data, hash } = await fetchHubbleJSON<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to mirror post.`);
        return null!;
    }

    async unmirrorPost(postId: string) {
        const { messageBytes } = await encodeMessageData(
            (fid) => ({
                type: MessageType.REACTION_REMOVE,
                reactionBody: {
                    type: ReactionType.RECAST,
                    targetCastId: {
                        hash: toBytes(postId),
                        fid,
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
        const { data, hash } = await fetchHubbleJSON<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to unmirror post.`);
        return null!;
    }

    async follow(profileId: string) {
        const { messageBytes } = await encodeMessageData(
            () => ({
                type: MessageType.LINK_ADD,
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
        const { data, hash } = await fetchHubbleJSON<Message>(url, {
            method: 'POST',
            body: messageBytes,
        });
        if (!data) throw new Error(t`Failed to follow.`);
        return null!;
    }

    async unfollow(profileId: string) {
        const { messageBytes } = await encodeMessageData(
            () => ({
                type: MessageType.LINK_REMOVE,
                linkBody: {
                    type: 'unfollow',
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
        const { data, hash } = await fetchHubbleJSON<Message>(url, {
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
        const { signer, messageHash, messageSignature } = await encodeMessageData(
            () => {
                return {
                    type: MessageType.CAST_ADD,
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
            messageHash,
            messageSignature,
        };
    }

    async generateFrameSignaturePacket(
        postId: string,
        frame: Frame,
        index: Index,
        input?: string,
    ): Promise<FrameSignaturePacket> {
        const { messageBytes, messageHash, messageData } = await encodeMessageData(
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

        return {
            untrustedData: {
                fid: messageData.fid,
                url: frame.url,
                messageHash: `0x${Buffer.from(messageHash).toString('hex')}`,
                timestamp: messageData.timestamp,
                network: messageData.network,
                buttonIndex: index,
                inputText: input,
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
    }
}

export const HubbleSocialMediaProvider = new HubbleSocialMedia();
