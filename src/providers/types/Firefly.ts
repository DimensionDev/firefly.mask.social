export interface Cast {
    fid: string;
    hash: string;
    text: string;
    parent_hash?: string;
    parent_fid?: string;
    parent_url?: string;
    embeds: Array<{ url?: string }>;
    mentions: string[];
    mentions_positions: number[];
    mentions_user: Array<{
        fid: string;
        handle: string;
    }>;
    created_at: string;
    likeCount: number;
    recastCount: number;
    replyCount: string;
    parentCast?: Cast;
    liked: boolean;
    recasted: boolean;
    author: User;
    recastedBy?: User;
    timestamp?: string;
    rootParentCast?: Cast;
    root_parent_hash?: string;
    threads?: Cast[];
}

export interface User {
    pfp: string;
    username: string;
    display_name: string;
    bio?: string;
    following: number;
    followers: number;
    addresses: string[];
    fid: string;
    isFollowing?: boolean;
    isFollowedBack?: boolean;
}

export interface Profile {
    platform_id: string;
    platform: string;
    handle: string;
    name: string;
    hit: boolean;
    score: number;
}

export interface UsersData {
    list: User[];
    next_cursor: string;
}

export interface Notification {
    cast: Cast | null;
    notificationType: number;
    user: User | null;
    timestamp: string;
}

interface Response<T> {
    code: number;
    data: T;
}

export type UsersResponse = Response<UsersData>;

export type UserResponse = Response<User>;

export type ReactorsResponse = Response<{
    items: User[];
    nextCursor: string;
}>;

export type CastResponse = Response<Cast>;

export type CastsResponse = Response<{
    casts: Cast[];
    cursor: string;
}>;

export type SearchCastsResponse = Response<Cast[]>;

export type SearchProfileResponse = Response<{
    list: Array<Record<'lens' | 'farcaster', Profile[] | null>>;
    cursor: number;
    size: number;
}>;

export type NotificationResponse = Response<{ notifications: Notification[]; cursor: string }>;

export type CommentsResponse = Response<{
    comments: Cast[];
    cursor: string;
}>;

export type UploadMediaTokenResponse = Response<{
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
}>;

export type FriendshipResponse = Response<{
    isFollowing: boolean;
    isFollowedBack: boolean;
}>;

export type ThreadResponse = Response<{
    threads: Cast[];
}>;

export type LensLoginResponse = Response<{
    accessToken: string;
    accountId: string;
}>;

export type FarcasterLoginResponse = Response<{
    accessToken: string;
    accountId: string;
    farcaster_signer_public_key?: string;
    farcaster_signer_private_key?: string;
    fid: string;
}>;
