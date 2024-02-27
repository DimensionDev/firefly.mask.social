import { CastAddBody, Factories, Message, MessageType, ReactionType } from '@farcaster/core';
import { t } from '@lingui/macro';
import { toInteger } from 'lodash-es';
import urlcat from 'urlcat';
import { toBytes } from 'viem';

import { SocialPlatform } from '@/constants/enum.js';
import { HUBBLE_URL } from '@/constants/index.js';
import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import type { FrameSignaturePacket, SignaturePacket } from '@/providers/types/Hubble.js';
import { type Post, ProfileStatus, type Provider, SessionType } from '@/providers/types/SocialMedia.js';
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

// @ts-ignore
export class HubbleSocialMedia implements Provider {
    get type() {
        return SessionType.Farcaster;
    }

    async publishPost(post: Post): Promise<Post> {
        const { messageBytes } = await encodeMessageData(
            () => {
                const data: {
                    castAddBody: CastAddBody;
                } = {
                    castAddBody: {
                        embedsDeprecated: [],
                        mentions: [],
                        mentionsPositions: [],
                        text: post.metadata.content?.content ?? '',
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

        return {
            source: SocialPlatform.Farcaster,
            postId: hash,
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
        return null!;
    }

    async unmirrorPost(postId: string, authorId: number) {
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
        return null!;
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

        console.log('DEBUG: valid');
        console.log({
            valid,
            message,
        });

        if (valid) return true;
        return false;
    }

    async generateSignaturePacket(): Promise<SignaturePacket> {
        const { signer, messageDataHash, messageDataSignature } = await encodeMessageData(
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
            messageHash: messageDataHash,
            messageSignature: messageDataSignature,
        };
    }

    async generateFrameSignaturePacket(
        postId: string,
        frame: Frame,
        index: Index,
        input?: string,
    ): Promise<FrameSignaturePacket> {
        const { messageBytes, messageData, messageDataHash } = await encodeMessageData(
            (fid) => {
                const messageData = {
                    type: MessageType.FRAME_ACTION,
                    frameActionBody: {
                        url: toBytes(frame.url),
                        buttonIndex: index,
                        castId: {
                            fid,
                            hash: toBytes(postId),
                        },
                        inputText: input ? toBytes(input) : undefined,
                        state: frame.state ? toBytes(frame.state) : undefined,
                    },
                };

                // clean up undefined fields
                if (typeof messageData.frameActionBody.inputText === 'undefined')
                    delete messageData.frameActionBody.inputText;
                if (typeof messageData.frameActionBody.state === 'undefined') delete messageData.frameActionBody.state;

                return messageData;
            },
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
                castId: {
                    fid: messageData.fid,
                    hash: postId,
                },
                state: frame.state,
            },
            trustedData: {
                // no 0x prefix
                messageBytes: Buffer.from(messageBytes).toString('hex'),
            },
        };

        // clean up undefined fields
        if (typeof packet.untrustedData.inputText === 'undefined') delete packet.untrustedData.inputText;
        if (typeof packet.untrustedData.state === 'undefined') delete packet.untrustedData.state;

        return packet;
    }
}

export const HubbleSocialMediaProvider = new HubbleSocialMedia();
