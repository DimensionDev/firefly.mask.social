import type { Pageable } from '@masknet/shared-base';
import { ChainId } from '@masknet/web3-shared-evm';

import type { PageIndicator } from '@/helpers/pageable.js';
import type {
    ActivityInfoResponse,
    ActivityListItem,
    FireflyWalletConnection,
    Response,
} from '@/providers/types/Firefly.js';

export enum Level {
    Lv1 = 'lv1',
    Lv2 = 'lv2',
}

export interface X {
    twitterId: string;
    address: string;
    following: boolean;
    hasVerified: boolean;
    valid: boolean;
    level: Level;
}

export interface Farcaster {
    level: Level;
    alreadyClaimed: boolean;
    fid: string;
    isPowerUser: boolean;
    valid: boolean;
    isFollowing: boolean;
}

export interface BnbId {
    lessThan4Char: boolean;
    name: string;
    address: string;
    valid: boolean;
    level: Level;
}

export interface Firefly {
    isNew: boolean;
    valid: boolean;
    level: Level;
}

export interface Balance {
    address: string;
    balance: number;
    valid: boolean;
    level: Level;
}

export type CheckResponse = Response<{
    alreadyClaimed: boolean;
    canClaim: boolean;
    x: X;
    farcaster: Farcaster;
    balance: Balance;
    firefly: Firefly;
    address: string;
    claimCondition: [];
}>;

export type MintActivitySBTResponse = Response<{
    status: boolean;
    hash: string;
    errormessage?: string;
    chainId: ChainId;
}>;

export interface Provider {
    getActivityClaimCondition: (
        name: string,
        options?: {
            address?: string;
            authToken?: string;
        },
    ) => Promise<CheckResponse['data']>;

    getActivityInfo: (name: string) => Promise<ActivityInfoResponse['data']>;

    getActivityList: (indicator?: PageIndicator, size?: number) => Promise<Pageable<ActivityListItem, PageIndicator>>;

    claimActivitySBT: (
        address: string,
        activityName: string,
        options?: {
            authToken?: string;
        },
    ) => Promise<MintActivitySBTResponse['data']>;

    getAllConnections: (params?: {
        authToken?: string;
    }) => Promise<{ connected: FireflyWalletConnection[]; related: FireflyWalletConnection[] }>;
}