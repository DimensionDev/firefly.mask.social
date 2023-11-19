import urlcat from 'urlcat';
import { EMPTY_LIST, FIREFLY_HUBBLE_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { createPageable, type PageIndicator } from '@masknet/shared-base';
import { ProfileStatus, type Provider, Type, type Post } from '@/providers/types/SocialMedia.js';
import type { CastResponse, UsersResponse, UserResponse, CastsResponse } from '@/providers/types/Firefly.js';
import * as ed from '@noble/ed25519'
import { sha512 } from '@noble/hashes/sha512'
import type { CastsResponse as DiscoverPosts } from '@/providers/types/Warpcast.js';
import {
    FarcasterNetwork,
    MessageType,
    Message,
    MessageData,
    HashScheme,
    SignatureScheme,
} from '@/providers/firefly/proto/message.js';
import type { ResponseJSON } from '@/types/index.js';
import { blake3 } from 'hash-wasm';
import { waitForSignedKeyRequestComplete } from '@/helpers/waitForSignedKeyRequestComplete.js';
import { toBytes } from 'viem';
import { FireflySession } from '@/providers/firefly/Session.js';
ed.etc.sha512Sync = (...m: any) => sha512(ed.etc.concatBytes(...m))

// @ts-ignore
export class FireflySocialMedia implements Provider {
    get type() {
        return Type.Firefly;
    }

    async createSessionByGrantPermission(setUrl: (url: string) => void, signal?: AbortSignal) {
        const response = await fetchJSON<
            ResponseJSON<{
                publicKey: string;
                privateKey: string;
                fid: string;
                token: string;
                timestamp: number;
                expiresAt: number;
                deeplinkUrl: string;
            }>
        >('/api/warpcast/signin', {
            method: 'POST',
        });
        if (!response.success) throw new Error(response.error.message);

        // present QR code to the user
        setUrl(response.data.deeplinkUrl);
        console.log('DEBUG: response');
        console.log(response);

        await waitForSignedKeyRequestComplete(signal)(response.data.token);
        console.log('DEBUG: signed key request complete');

        const session = new FireflySession(
            response.data.fid,
            response.data.privateKey,
            response.data.timestamp,
            response.data.expiresAt,
        );
        localStorage.setItem('firefly_session', session.serialize());
        return session;
    }

    // @ts-ignore
    async resumeSession(): Promise<FireflySession | null> {
        const currentTime = Date.now();

        const storedSession = localStorage.getItem('firefly_session');

        if (storedSession) {
            const recoverdSession = FireflySession.deserialize(storedSession);
            if (recoverdSession.expiresAt > currentTime) {
                return recoverdSession;
            } else {
                return null;
            }
        }
        return null;
    }

    async discoverPosts(indicator?: PageIndicator) {
        const url = urlcat('https://client.warpcast.com/v2', '/popular-casts-feed', {
            limit: 10,
            cursor: indicator?.id,
        });

        const { result, next } = await fetchJSON<DiscoverPosts>(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = result.casts.map((cast) => {
            return {
                postId: cast.hash,
                parentPostId: cast.threadHash,
                timestamp: cast.timestamp,
                author: {
                    profileId: cast.author.fid.toString(),
                    nickname: cast.author.username,
                    displayName: cast.author.displayName,
                    pfp: cast.author.pfp.url,
                    followerCount: cast.author.followerCount,
                    followingCount: cast.author.followingCount,
                    status: ProfileStatus.Active,
                    verified: cast.author.pfp.verified,
                },
                metadata: {
                    locale: '',
                    content: cast.text,
                },
                stats: {
                    comments: cast.replies.count,
                    mirrors: cast.recasts.count,
                    quotes: cast.recasts.count,
                    reactions: cast.reactions.count,
                },
            };
        });
        return createPageable(data, indicator?.id, next.cursor);
    }

    async getPostById(postId: string) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/cast', { hash: postId });
        const { data: cast } = await fetchJSON<CastResponse>(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        return {
            postId: cast.hash,
            parentPostId: cast.parent_hash,
            timestamp: Number(cast.created_at),
            author: {
                profileId: cast.author.fid,
                nickname: cast.author.username,
                displayName: cast.author.display_name,
                pfp: cast.author.pfp,
                followerCount: cast.author.followers,
                followingCount: cast.author.following,
                status: ProfileStatus.Active,
                verified: true,
            },
            metadata: {
                locale: '',
                content: cast.text,
            },
            stats: {
                comments: cast.replyCount,
                mirrors: cast.recastCount,
                quotes: cast.recastCount,
                reactions: cast.likeCount,
            },
        };
    }

    async getProfileById(profileId: string) {
        const url = urlcat(FIREFLY_ROOT_URL, '/user', { fid: profileId });
        const { data: user } = await fetchJSON<UserResponse>(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        return {
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
        };
    }

    async getFollowers(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followers', {
            fid: profileId,
            size: 10,
            cursor: indicator?.id,
        });
        const {
            data: { list, next_cursor },
        } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = list.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
        }));

        return createPageable(data, indicator?.id, next_cursor);
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followings', {
            fid: profileId,
            size: 10,
            cursor: indicator?.id,
        });
        const {
            data: { list, next_cursor },
        } = await fetchJSON<UsersResponse>(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = list.map((user) => ({
            profileId: user.fid.toString(),
            nickname: user.username,
            displayName: user.display_name,
            pfp: user.pfp,
            followerCount: user.followers,
            followingCount: user.following,
            status: ProfileStatus.Active,
            verified: true,
        }));

        return createPageable(data, indicator?.id, next_cursor);
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster', {
            fids: [profileId],
            size: 10,
            cursor: indicator?.id,
        });
        const {
            data: { casts, cursor },
        } = await fetchJSON<CastsResponse>(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = casts.map((cast) => ({
            postId: cast.hash,
            parentPostId: cast.parent_hash,
            timestamp: Number(cast.created_at),
            author: {
                profileId: cast.author.fid,
                nickname: cast.author.username,
                displayName: cast.author.display_name,
                pfp: cast.author.pfp,
                followerCount: cast.author.followers,
                followingCount: cast.author.following,
                status: ProfileStatus.Active,
                verified: true,
            },
            metadata: {
                locale: '',
                content: cast.text,
            },
            stats: {
                comments: cast.replyCount,
                mirrors: cast.recastCount,
                quotes: cast.recastCount,
                reactions: cast.likeCount,
            },
        }));
        return createPageable(data, indicator?.id, cursor);
    }

    async publishPost(post: Post) {
        const session = await this.resumeSession();
        if (!session) throw new Error('No session found');
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.MESSAGE_TYPE_CAST_ADD,
            fid: Number(session.profileId),
            timestamp: Math.floor(Date.now() / 1000),
            network: FarcasterNetwork.FARCASTER_NETWORK_MAINNET,
            castAddBody: {
                embedsDeprecated: EMPTY_LIST,
                mentions: EMPTY_LIST,
                text: post.metadata.content,
                mentionsPositions: [],
                embeds: post.mediaObjects?.map((v) => ({ url: v.url })) ?? EMPTY_LIST,
            },
        };

        
        const encodedData = MessageData.encode(messageData).finish();

        const messageHash = await blake3(encodedData);

        const signature = await ed.signAsync(encodedData, toBytes(session.token));

        const message = {
            data: messageData,
            hash: toBytes(messageHash),
            hashScheme: HashScheme.HASH_SCHEME_BLAKE3,
            signature,
            signatureScheme: SignatureScheme.SIGNATURE_SCHEME_ED25519,
            signer: ed.getPublicKey(toBytes(session.token)),
        };
        console.log(message)
        const encodedMessage = Buffer.from(Message.encode(message).finish());
        console.log('DEBUG: encodedMessage', encodedMessage);

        const {data, hash} = await fetchJSON<Message>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: encodedMessage,
        });
        if(!data) throw new Error('Failed to publish post')
        return {
                postId: hash.toString(),
                parentPostId: "",
                timestamp: data.timestamp,
                author: {
                    profileId: data?.fid.toString(),
                    nickname: "",
                    displayName: "",
                    pfp: "",
                    followerCount: 0,
                    followingCount: 0,
                    status: ProfileStatus.Active,
                    verified: true,
                },
                metadata: {
                    locale: '',
                    content: data.castAddBody?.text || "",
                },
                stats: {
                    comments: 0,
                    mirrors: 0,
                    quotes: 0,
                    reactions: 0,
                },
            }
    }
    
}
