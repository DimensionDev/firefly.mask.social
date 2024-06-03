export interface Response<T> {
    code: number;
    data: T;
    error?: string[];
}

export type DiscoverNFTResponse = Response<{
    feeds: NFTFeed[];
    hasMore: boolean;
}>;

export enum NFTFeedTransAction {
    Mint = 'mint',
    Transfer = 'transfer',
    Trade = 'trade',
    Burn = 'burn',
}

export interface NFTOwnerDisplayInfo {
    ensHandle: string | null;
    avatarUrl: string;
}

export interface NFTFeed {
    address: string;
    followers_count: number | null;
    twitter_id: string | null;
    twitter_handle: string;
    displayInfo: NFTOwnerDisplayInfo;
    trans: {
        id: number;
        time: number;
        block_id: string;
        action: NFTFeedTransAction;
        token_list: Array<{
            id: string;
            cnt: number;
        }>;
        token_address: string;
        token_name: string;
        price: number;
    };
    recommend_reason: string;
    id: number;
}

export type GetFollowingNFTResponse = Response<{
    result: FollowingNFT[];
    cursor: string | null;
}>;

export interface FollowingNFT {
    timestamp: string;
    hash: string;
    owner: string;
    address_from: string;
    address_to: string;
    network: string;
    tag: string;
    type: string;
    actions: FollowingNFTAction[];
    displayInfo: NFTOwnerDisplayInfo;
    followingSources: Array<{
        id: string;
        handle: string | null;
        name: string | null;
        type: string;
        socialId: string | null;
        walletAddress: string;
    }>;
}

export interface FollowingNFTAction {
    tag: string;
    type: string;
    index: number;
    address_from: string;
    address_to: string;
    cost: null; // TODO: confirm number or string
    contract_address: string;
    token_id: string;
}
