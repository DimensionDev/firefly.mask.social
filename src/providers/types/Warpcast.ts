export interface CastsResponse {
    result: CastsResult;
    next: Next;
}

export interface CastResponse {
    result: Cast;
}

export interface FeedResponse {
    result: FeedResult;
    next: Next;
}

export interface UserResponse {
    result: Profile;
}
export interface CastsResult {
    casts: Cast[];
}

export interface FeedResult {
    feed: Feed[];
}

export interface UsersResponse {
    result: Profile[];
    next: Next;
}

export interface Feed {
    cast: Cast;
    id: string;
    timestamp: number;
    otherParticipants: Author[];
    replies?: Cast[];
}

export interface Cast {
    hash: string;
    parentHash: string;
    parentAuthor: Author;
    embeds?: {
        images: Array<{
            type: string;
            sourceUrl: string;
            url: string;
            alt: string;
        }>;
        processedCastText: string;
        unknowns: unknown[];
        urls: Array<{
            type: string;
            openGraph: {
                description: string;
                domain: string;
                image: string;
                logo: string;
                sourceUrl: string;
                title: StaticRange;
                url: string;
                userLargeImage: boolean;
            };
        }>;
        videos: Array<{
            url: string;
            type: string;
        }>;
    };
    threadHash: string;
    author: Author;
    text: string;
    timestamp: number;
    replies: Replies;
    reactions: Reactions;
    recasts: Recasts;
    watches: Watches;
    recast: boolean;
    viewerContext: ViewerContext;
}

export interface Author {
    fid: number;
    username: string;
    displayName: string;
    pfp: Pfp;
    followerCount: number;
    followingCount: number;
    profile: {
        bio: {
            mention: string[];
            text: string;
        };
        location: {
            description: string;
            placeId: string;
        };
        username: string;
    };
}

export interface Pfp {
    url: string;
    verified: boolean;
}

export interface Replies {
    count: number;
}

export interface Reactions {
    count: number;
}

export interface Recasts {
    count: number;
    recasters: Recaster[];
}

export interface Recaster {
    fid: number;
    username: string;
    displayName: string;
}

export interface Watches {
    count: number;
}

export interface ViewerContext {
    reacted: boolean;
    recast: boolean;
    watched: boolean;
}

export interface Next {
    cursor: string;
}

export interface Profile {
    fid: number;
    username: string;
    displayName: string;
    pfp: {
        url: string;
        verified: boolean;
    };
    profile: {
        bio: {
            text: string;
            mentions: unknown[];
        };
    };
    followerCount: number;
    followingCount: number;
    referrerUsername: string;
    viewerContext: {
        following: boolean;
        followedBy: boolean;
        canSendDirectCasts: boolean;
    };
}

export interface ReactionInfo {
    type: string;
    hash: string;
    reactor: Profile;
    timestamp: number;
    castHash: string;
}

export interface ReactionResponse {
    result: ReactionInfo;
}

export interface SuccessResponse {
    result: {
        success: boolean;
    };
}
