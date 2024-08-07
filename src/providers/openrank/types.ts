export interface TopProfile {
    fid: number;
    fname: string;
    username: string;
    rank: number;
    score: number;
    percentile: number;
}

export interface PostForYouByAuthorship {
    cast_hash: string;
    fid: number;
    timestamp: string;
}

export interface FeedPost {
    postId: string;
    handle: string;
    rank: string;
    mirrorsCount: number;
    commentsCount: number;
    collectsCount: number;
    upvotesCount: number;
    v: number | null;
    createdAt: string;
    contentUri: string;
}
