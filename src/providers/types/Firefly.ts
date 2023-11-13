export interface Cast {
    fid: string;
    hash: string;
    text: string;
    parent_hash?: string;
    parent_fid?: string;
    parent_url?: string;
    embeds: string[];
    mentions: string[];
    mentions_positions: number[];
    created_at: string;
    likeCount: number;
    recastCount: number;
    replyCount: number;
    parentCast?: Cast;
    liked: boolean;
    recasted: boolean;
    author: User;
    recastedBy?: User;
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
