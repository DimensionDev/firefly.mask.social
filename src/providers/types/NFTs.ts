import type { Address } from 'viem';

import { type FollowingSource } from '@/providers/types/Firefly.js';

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
    Poap = 'poap',
}

export interface NFTOwnerDisplayInfo {
    ensHandle: string | null;
    avatarUrl: string;
}

export interface NFTFeed {
    /** User address */
    address: Address;
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
        token_address: Address;
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
    owner: Address;
    address_from: string;
    address_to: string;
    network: string;
    tag: string;
    type: NFTFeedTransAction;
    actions: FollowingNFTAction[];
    displayInfo: NFTOwnerDisplayInfo;
    followingSources: FollowingSource[];
}

export interface NFTActionCost {
    decimals: number;
    symbol: string;
    value: string;
}

export interface FollowingNFTAction {
    tag: string;
    type: NFTFeedTransAction;
    index: number;
    address_from: string;
    address_to: string;
    cost?: NFTActionCost;
    contract_address: Address;
    token_id: string;
}
