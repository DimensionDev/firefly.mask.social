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
