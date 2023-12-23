import { Message } from '@farcaster/hub-web';
import { t } from '@lingui/macro';
import type { Pageable, PageIndicator } from '@masknet/shared-base';
import { toInteger } from 'lodash-es';
import urlcat from 'urlcat';
import { bytesToHex, toBytes, toHex } from 'viem';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST, FIREFLY_HUBBLE_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { encodeMessageData } from '@/helpers/encodeMessageData.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { MessageType, ReactionType } from '@/providers/hubble/proto/message.js';
import type { UserResponse } from '@/providers/types/Firefly.js';
import { type Post, type Profile, ProfileStatus, type Provider, SessionType } from '@/providers/types/SocialMedia.js';
import { ReactionType as ReactionTypeCustom } from '@/providers/types/SocialMedia.js';
import type { FarcasterSession } from '@/providers/farcaster/Session.js';

// @ts-ignore
export class HubbleSocialMedia implements Provider {
    get type() {
        return SessionType.Farcaster;
    }

    async createSession(signal?: AbortSignal): Promise<FarcasterSession> {
        throw new Error('Please use createSessionByGrantPermission() instead.');
    }

    async discoverPosts(indicator?: PageIndicator): Promise<Pageable<Post, PageIndicator>> {
        throw new Error('Method not implemented.');
    }

    async getPostById(postId: string): Promise<Post> {
        throw new Error('Method not implemented.');
    }

    async getProfileById(profileId: string) {
        const { data: user } = await fetchJSON<UserResponse>(urlcat(FIREFLY_ROOT_URL, '/user', { fid: profileId }), {
            method: 'GET',
        });

        return {
            fullHandle: user.username,
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

    async publishPost(post: Post, parentPost?: Post | null): Promise<Post> {
        const { bytes } = await encodeMessageData(() => ({
            type: MessageType.CAST_ADD,
            castAddBody: {
                embedsDeprecated: [],
                parentCastId: parentPost
                    ? {
                          fid: toInteger(parentPost.author.profileId),
                          hash: toBytes(parentPost.postId),
                      }
                    : undefined,
                parentUrl: undefined,
                mentions: [],
                text: post.metadata.content?.content ?? '',
                mentionsPositions: [],
                embeds: post.mediaObjects?.map((v) => ({ url: v.url })) ?? [],
            },
        }));

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
            },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to publish post`);

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

    async upvotePost(postId: string) {
        const { bytes, messageHash, messageData } = await encodeMessageData((fid) => ({
            type: MessageType.REACTION_ADD,
            reactionBody: {
                type: ReactionType.LIKE,
                targetCastId: {
                    hash: toBytes(postId),
                    fid,
                },
            },
        }));

        const { data } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to upvote post`);

        return {
            reactionId: bytesToHex(messageHash),
            type: ReactionTypeCustom.Upvote,
            timestamp: messageData.timestamp,
        };
    }

    async unvotePost(postId: string) {
        const { bytes } = await encodeMessageData((fid) => ({
            type: MessageType.REACTION_REMOVE,
            reactionBody: {
                type: ReactionType.LIKE,
                targetCastId: {
                    hash: toBytes(postId),
                    fid,
                },
            },
        }));

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to unvote post`);
        return;
    }

    /**
     * @deprecated
     * Use publishPost with parent post instead
     */
    async commentPost(postId: string, comment: string) {
        const { bytes } = await encodeMessageData((fid) => ({
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
        }));

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to publish post`);
        return toHex(hash);
    }

    async mirrorPost(postId: string) {
        const { bytes } = await encodeMessageData((fid) => ({
            type: MessageType.REACTION_ADD,
            reactionBody: {
                type: ReactionType.RECAST,
                targetCastId: {
                    hash: toBytes(postId),
                    fid,
                },
            },
        }));

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to mirror post`);
        return null!;
    }

    async unmirrorPost(postId: string) {
        const { bytes } = await encodeMessageData((fid) => ({
            type: MessageType.REACTION_REMOVE,
            reactionBody: {
                type: ReactionType.RECAST,
                targetCastId: {
                    hash: toBytes(postId),
                    fid,
                },
            },
        }));

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to unmirror post`);
        return null!;
    }

    async follow(profileId: string) {
        const { bytes } = await encodeMessageData(() => ({
            type: MessageType.LINK_ADD,
            linkBody: {
                type: '1',
                targetFid: Number(profileId),
            },
        }));

        const { data, hash } = await fetchJSON<Message>(urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: bytes,
        });
        if (!data) throw new Error(t`Failed to follow`);
        return null!;
    }

    async unfollow(profileId: string) {
        const { bytes } = await encodeMessageData(() => ({
            type: MessageType.LINK_REMOVE,
            linkBody: {
                type: '1',
                targetFid: Number(profileId),
            },
        }));

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
