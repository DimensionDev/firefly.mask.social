import { ChainId } from '@masknet/web3-shared-evm';

import type { Pageable, PageIndicator } from '@/helpers/pageable.js';
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
    followingPudge?: boolean;
}

export interface Farcaster {
    level: Level;
    alreadyClaimed: boolean;
    fid: string;
    isPowerUser: boolean;
    valid: boolean;
    isFollowing: boolean;
    isSupercast?: boolean;
    hasThirdpartSigner?: boolean;
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

export enum ActivityElex24VoteOption {
    Trump = 'trump',
    Harris = 'harris',
}

export interface Assets {
    alreadyClaimed: boolean;
    anonBalance: string;
    degenBalance: string;
    level: Level;
    valid: boolean;
}

export interface NFT {
    address: string;
    valid: boolean;
    level: Level;
    alreadyClaimed: boolean;
    ownPudgy: boolean;
    ownLil: boolean;
    ownTruePengu: boolean;
    ownPenguPins: boolean;
    participationBlocked: boolean;
}

export type CheckResponse = Response<{
    alreadyClaimed: boolean;
    canClaim: boolean;
    x: X;
    nft?: NFT;
    participationBlocked?: boolean;
    farcaster: Farcaster;
    assets: Assets;
    balance: Balance;
    firefly: Firefly;
    address: string;
    claimCondition: [];
    ext?: {
        vote?: ActivityElex24VoteOption;
    };
}>;

export type MintActivitySBTResponse = Response<{
    status: boolean;
    hash: string;
    errormessage?: string;
    chainId: ChainId | 'solana';
}>;

export interface Provider {
    getActivityClaimCondition: (name: string, address?: string) => Promise<CheckResponse['data']>;

    getActivityInfo: (name: string) => Promise<ActivityInfoResponse['data']>;

    getActivityList: (indicator?: PageIndicator, size?: number) => Promise<Pageable<ActivityListItem, PageIndicator>>;

    claimActivitySBT: (
        address: string,
        activityName: string,
        claimApiExtraParams?: Record<string, unknown>,
    ) => Promise<MintActivitySBTResponse['data']>;

    getAllConnections: () => Promise<{ connected: FireflyWalletConnection[]; related: FireflyWalletConnection[] }>;
}
