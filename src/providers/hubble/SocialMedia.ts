import { Message } from '@farcaster/hub-web';
import { t } from '@lingui/macro';
import type { Pageable, PageIndicator } from '@masknet/shared-base';
import urlcat from 'urlcat';
import { toBytes } from 'viem';

import { warpcastClient } from '@/configs/warpcastClient.js';
import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST, FIREFLY_HUBBLE_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { FarcasterNetwork, MessageType, ReactionType } from '@/providers/hubble/proto/message.js';
import type { UserResponse } from '@/providers/types/Firefly.js';
import { type Post, type Profile, ProfileStatus, type Provider, Type } from '@/providers/types/SocialMedia.js';
import { ReactionType as ReactionTypeCustom } from '@/providers/types/SocialMedia.js';
import type { WarpcastSession } from '@/providers/warpcast/Session.js';

// @ts-ignore
export class HubbleSocialMedia implements Provider {
    get type() {
        return Type.Firefly;
    }

    async createSession(signal?: AbortSignal): Promise<WarpcastSession> {
        throw new Error('Please use createSessionByGrantPermission() instead.');
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostById(postId: string): Promise<Post> {
        throw new Error('Method not implemented.');
    }

    async getProfileById(profileId: string) {
        const url = urlcat(FIREFLY_ROOT_URL, '/user', { fid: profileId });
        const { data: user } = await fetchJSON<UserResponse>(url, {
            method: 'GET',
        });

        return {
            profileId: user.fid.toString(),
            handle: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
            source: SocialPlatform.Farcaster,
        };
    }

    async getPostsByParentPostId(postId: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getFollowers(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    async getFollowings(profileId: string, indicator?: PageIndicator): Promise<Pageable<Profile>> {
        throw new Error('Method not implemented.');
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator): Promise<Pageable<Post>> {
        throw new Error('Method not implemented.');
    }

    async publishPost(post: Post): Promise<Post> {
        const session = warpcastClient.getSessionRequired();

        const { bytes } = await encodeMessageData(
            {
                type: MessageType.CAST_ADD,
                fid: Number(session.profileId),
                timestamp: Math.floor(Date.now() / 1000),
                network: FarcasterNetwork.MAINNET,
                castAddBody: {
                    embedsDeprecated: EMPTY_LIST,
                    mentions: EMPTY_LIST,
                    text: post.metadata.content?.content ?? '',
                    mentionsPositions: EMPTY_LIST,
                    embeds: post.mediaObjects?.map((v) => ({ url: v.url })) ?? EMPTY_LIST,
                },
            },
            session.token,
        );

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to publish post`);

        return {
            source: SocialPlatform.Farcaster,
            postId: `0x${Buffer.from(hash).toString('hex')}`,
            parentPostId: '',
            timestamp: data.timestamp,
            author: {
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

    async upvotePost(postId: string) {
        const session = warpcastClient.getSessionRequired();

        const { bytes, messageHash, messageData } = await encodeMessageData(
            {
                type: MessageType.REACTION_ADD,
                fid: Number(session.profileId),
                timestamp: Math.floor(Date.now() / 1000),
                network: FarcasterNetwork.MAINNET,
                reactionBody: {
                    type: ReactionType.LIKE,
                    targetCastId: {
                        hash: toBytes(postId),
                        fid: Number(session.profileId),
                    },
                },
            },
            session.token,
        );

        const { data } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to upvote post`);

        return {
            reactionId: messageHash,
            type: ReactionTypeCustom.Upvote,
            timestamp: messageData.timestamp,
        };
    }

    async unvotePost(postId: string) {
        const session = warpcastClient.getSessionRequired();

        const { bytes } = await encodeMessageData(
            {
                type: MessageType.REACTION_REMOVE,
                fid: Number(session.profileId),
                timestamp: Math.floor(Date.now() / 1000),
                network: FarcasterNetwork.MAINNET,
                reactionBody: {
                    type: ReactionType.LIKE,
                    targetCastId: {
                        hash: toBytes(postId),
                        fid: Number(session.profileId),
                    },
                },
            },
            session.token,
        );

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to unvote post`);
        return;
    }

    async commentPost(postId: string, comment: string) {
        const session = warpcastClient.getSessionRequired();
        const { bytes } = await encodeMessageData(
            {
                type: MessageType.CAST_ADD,
                fid: Number(session.profileId),
                timestamp: Math.floor(Date.now() / 1000),
                network: FarcasterNetwork.MAINNET,
                castAddBody: {
                    parentCastId: {
                        hash: toBytes(postId),
                        fid: Number(session.profileId),
                    },
                    embedsDeprecated: EMPTY_LIST,
                    mentions: EMPTY_LIST,
                    text: comment,
                    mentionsPositions: EMPTY_LIST,
                    embeds: EMPTY_LIST,
                },
            },
            session.token,
        );

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to publish post`);
        return;
    }

    async mirrorPost(postId: string) {
        const session = warpcastClient.getSessionRequired();

        const { bytes } = await encodeMessageData(
            {
                type: MessageType.REACTION_ADD,
                fid: Number(session.profileId),
                timestamp: Math.floor(Date.now() / 1000),
                network: FarcasterNetwork.MAINNET,
                reactionBody: {
                    type: ReactionType.RECAST,
                    targetCastId: {
                        hash: toBytes(postId),
                        fid: Number(session.profileId),
                    },
                },
            },
            session.token,
        );

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to mirror post`);
        return null!;
    }

    async unmirrorPost(postId: string) {
        const session = warpcastClient.getSessionRequired();

        const { bytes } = await encodeMessageData(
            {
                type: MessageType.REACTION_REMOVE,
                fid: Number(session.profileId),
                timestamp: Math.floor(Date.now() / 1000),
                network: FarcasterNetwork.MAINNET,
                reactionBody: {
                    type: ReactionType.RECAST,
                    targetCastId: {
                        hash: toBytes(postId),
                        fid: Number(session.profileId),
                    },
                },
            },
            session.token,
        );

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to unmirror post`);
        return null!;
    }

    async follow(profileId: string) {
        const session = warpcastClient.getSessionRequired();

        const { bytes } = await encodeMessageData(
            {
                type: MessageType.LINK_ADD,
                fid: Number(session.profileId),
                timestamp: Math.floor(Date.now() / 1000),
                network: FarcasterNetwork.MAINNET,
                linkBody: {
                    type: '1',
                    targetFid: Number(profileId),
                },
            },
            session.token,
        );

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to follow`);
        return null!;
    }

    async unfollow(profileId: string) {
        const session = warpcastClient.getSessionRequired();

        const { bytes } = await encodeMessageData(
            {
                type: MessageType.LINK_REMOVE,
                fid: Number(session.profileId),
                timestamp: Math.floor(Date.now() / 1000),
                network: FarcasterNetwork.MAINNET,
                linkBody: {
                    type: '1',
                    targetFid: Number(profileId),
                },
            },
            session.token,
        );

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to unfollow`);
        return null!;
    }

    searchProfiles(q: string, indicator?: PageIndicator): Promise<Pageable<Profile, PageIndicator>> {
        throw new Error(t`Method not implemented.`);
    }

    searchPosts(q: string, indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error(t`Method not implemented.`);
    }
}

export const HubbleSocialMediaProvider = new HubbleSocialMedia();
