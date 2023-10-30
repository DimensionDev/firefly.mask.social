import { Session } from '@/providers/types/Session';

export enum Type {
    Twitter = 'Twitter',
    Farcaster = 'Farcaster',
    Warpcast = 'Warpcast',
}

export interface Profile {
    userId: string
    nickname: string
    displayName: string
    pfp: string
    bio?: string
    address?: string
    followerCount: number
    followingCount: number
    status: 'active' | 'inactive'
    viewerContext?: {
        following: boolean
        followedBy: boolean
    }
}

export interface MediaObject {
    title?: string
    url: string
    mimeType: string
}

export interface Post {
    postId: string;
    parentPostId?: string;
    parentAuthor?: Profile;
    text: string;
    timestamp: number;
    author: Profile;
    embedPosts?: Post[]
    mediaObjects?: MediaObject[];
    permalink?: string
    parentPermalink?: string
    reactions?: string[]
    reposts?: string[]
    replies?: string[]
    __original__?: unknown
}

export interface Provider {
    type: Type;

    /**
     * Initiates the login process for the provider.
     *
     * @returns A promise that resolves to an Auth object upon successful login.
     */
    createSession: () => Promise<Session>;

    getProfileById: (userId: string) => Promise<Profile>

    getRecentPosts: (userId: string) => Promise<Post[]>

    getPostById: (postId: string) => Promise<Post>

    getPostsByUserId: (userId: string) => Promise<Post[]>

    getPostsByUserMentioned: (userId: string) => Promise<Post[]>

    getPostsByUserLiked: (userId: string) => Promise<Post[]>

    getPostsByParentPostId: (postId: string) => Promise<Post[]>

    getReactorsByPostId: (postId: string) => Promise<Profile[]>

    getAllReactorsByPostId: (postId: string) => Promise<Profile[]>

    getFollowers: (userId: string) => Promise<string[]>

    getFollowings: (userId: string) => Promise<string[]>
}
