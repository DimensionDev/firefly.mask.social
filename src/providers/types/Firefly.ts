export interface Cast {
    fid: string;
    hash: string;
    text: string;
    parent_hash?: string;
    parent_fid?: string;
    parent_url?: string;
    embeds: Array<{ url: string }>;
    mentions: string[];
    mentions_positions: number[];
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
}

export interface User {
    pfp: string;
    username: string;
    display_name: string;
    bio: string;
    following: number;
    followers: number;
    addresses: string[];
    fid: string;
    isFollowing: boolean;
    isFollowedBack: boolean;
}

export interface UsersData {
    list: User[];
    next_cursor: string;
}

export interface UsersResponse {
    code: number;
    data: UsersData;
}

export interface UserResponse {
    code: number;
    data: User;
}

export interface ReactorsResponse {
    code: number;
    data: {
        items: User[];
        nextCursor: string;
    };
}

export interface CastResponse {
    code: number;
    data: Cast;
}

export interface CastsResponse {
    code: number;
    data: {
        casts: Cast[];
        cursor: string;
    };
}

export interface SearchCastsResponse {
    code: number;
    data: Cast[];
}

export interface Notification {
    cast: Cast | null;
    notificationType: number;
    user: User | null;
    timestamp: string;
}

export interface NotificationResponse {
    code: number;
    data: { notifications: Notification[]; cursor: string };
}

export interface CommentsResponse {
    code: number;
    data: {
        comments: Cast[];
        cursor: string;
    };
}
