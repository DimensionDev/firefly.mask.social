export interface ErrorResponse {
    errors: Array<{
        message: string;
        reason?: string;
    }>;
}

export interface CastsResponse extends ErrorResponse {
    result: {
        casts: Cast[];
    };
    next?: Next;
}

export interface SearchCastsResponse extends ErrorResponse {
    result: {
        casts: Cast[];
    };
    next?: Next;
}

export interface BookmarkedCastsResponse extends ErrorResponse {
    result: {
        bookmarks: Cast[];
    };
    next?: Next;
}

export interface CastResponse extends ErrorResponse {
    result: { cast: Cast };
}

export interface FeedResponse extends ErrorResponse {
    result: {
        feed: Feed[];
    };
    next?: Next;
}

export interface UserResponse extends ErrorResponse {
    result: {
        user: Profile;
    };
}

export interface UserDetailResponse extends ErrorResponse {
    result: {
        user: Profile;
    };
}

export interface UsersResponse extends ErrorResponse {
    result: Profile[];
    next?: Next;
}

export interface RecastersResponse extends ErrorResponse {
    result: {
        users: Profile[];
    };
    next?: Next;
}

export interface SearchUsersResponse extends ErrorResponse {
    result: {
        users: Profile[];
    };
    next?: Next;
}

export interface ReactionResponse extends ErrorResponse {
    result: ReactionInfo;
}

export interface SuccessResponse extends ErrorResponse {
    result: {
        success: boolean;
    };
}

export interface NotificationResponse extends ErrorResponse {
    result: {
        notifications: Notification[];
    };
    next?: Next;
}

export interface SignedKeyRequestResponse extends ErrorResponse {
    result: {
        signedKeyRequest: {
            deeplinkUrl: string;
            // state of the request taking one of the following values:
            // pending - no action has been taken by the user
            // approved - user has approved the request, an onchain transaction is being broadcast and confirmed
            // completed - the onchain transaction has completed
            state: 'pending' | 'approved' | 'completed';
            // requested key to add
            key: string;
            requestFid: number;
            token: string;
            userFid: number;
            isSponsored: boolean;
        };
    };
}

export interface Recast {
    displayName: string;
    fid: number;
    recastHash: string;
    username: string;
}
export interface Feed {
    cast: Cast;
    id: string;
    timestamp: number;
    otherParticipants: Author[];
    replies?: Cast[];
    recasts?: Recast[];
}

export interface Cast {
    hash: string;
    parentHash: string;
    parentAuthor: Author;
    castType?: string;
    embeds?: {
        images?: Array<{
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
        videos?: Array<{
            url: string;
            type: string;
        }>;
    };
    mentions?: Author[];
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
    pfp?: Pfp;
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
        location: {
            description: string;
            placeId: string;
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

export interface Notification {
    type: string;
    id: string;
    timestamp: number;
    actor: Profile;
    content: {
        cast: Cast;
    };
}

export interface LikesResponse extends ErrorResponse {
    result: {
        likes: ReactionInfo[];
    };
    next?: Next;
}
