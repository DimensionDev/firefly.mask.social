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
