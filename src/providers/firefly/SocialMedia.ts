import urlcat from 'urlcat';
import { EIP_712_FARCASTER_DOMAIN, EMPTY_LIST, FIREFLY_HUBBLE_URL, FIREFLY_ROOT_URL } from '@/constants/index.js';
import { fetchJSON } from '@/helpers/fetchJSON.js';
import { type PageIndicator, createPageable } from '@/helpers/createPageable.js';
import { ProfileStatus, type Provider, Type, type Post } from '@/providers/types/SocialMedia.js';
import type { CastResponse, UsersResponse, UserResponse, CastsResponse } from '@/providers/types/Firefly.js';
import type { CastsResponse as DiscoverPosts } from '@/providers/types/Warpcast.js';
import { getWalletClient } from 'wagmi/actions';
import {
    FarcasterNetwork,
    MessageType, Message,
    MessageData,
    MessageDataEIP712Type,
    HashScheme,
    SignatureScheme,
} from '@/providers/firefly/proto/message.js';
import { blake3 } from 'hash-wasm';
import { toBytes } from 'viem'


// @ts-ignore
export class FireflySocialMedia implements Provider {
    private currentFid: number | null = null;

    get type() {
        return Type.Firefly;
    }

    async discoverPosts(indicator?: PageIndicator) {
        const url = urlcat('https://client.warpcast.com/v2', '/popular-casts-feed', {
            limit: 10,
            cursor: indicator?.cursor,
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
        return createPageable(data, indicator?.cursor, next.cursor);
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
            cursor: indicator?.cursor,
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

        return createPageable(data, indicator?.cursor, next_cursor);
    }

    async getFollowings(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/farcaster-hub/followings', {
            fid: profileId,
            size: 10,
            cursor: indicator?.cursor,
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

        return createPageable(data, indicator?.cursor, next_cursor);
    }

    async getPostsByProfileId(profileId: string, indicator?: PageIndicator) {
        const url = urlcat(FIREFLY_ROOT_URL, '/v2/user/timeline/farcaster', {
            fids: [profileId],
            size: 10,
            cursor: indicator?.cursor,
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
        return createPageable(data, indicator?.cursor, cursor);
    }

    async publishPost(post: Post) {
        const wallet = await getWalletClient();
        if (!this.currentFid || !wallet) return;
        const url = urlcat(FIREFLY_HUBBLE_URL, '/v1/submitMessage');
        const messageData: MessageData = {
            type: MessageType.MESSAGE_TYPE_CAST_ADD,
            fid: this.currentFid,
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
        const signature = await wallet?.signTypedData({
            domain: EIP_712_FARCASTER_DOMAIN,
            types: MessageDataEIP712Type,
            primaryType: 'MessageData',
            message: { ...messageData },
        });

        const encodedData = MessageData.encode(messageData)

        const hash = await blake3(encodedData) 
        
        const message = {
            data: messageData,            
            hash: toBytes(hash),                     
            hashScheme: HashScheme.HASH_SCHEME_BLAKE3,            
            signature: toBytes(signature),               
            signatureScheme :SignatureScheme.SIGNATURE_SCHEME_EIP712,
            signer:toBytes(wallet.account.address)
        }
        const encodedMessage = Message.encode(message)

        const result = await fetchJSON<CastResponse>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: encodedMessage
        }); 
    }
}
