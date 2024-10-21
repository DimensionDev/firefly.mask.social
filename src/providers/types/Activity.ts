import type { Response } from '@/providers/types/Firefly.js';

export enum Level {
    Lv1 = 'lv1',
    Lv2 = 'lv2',
}

export interface X {
    twitterId: string;
    address: string;
    following: boolean;
    followingFirefly: boolean;
    hasVerified: boolean;
    valid: boolean;
    level: Level;
}

export interface Farcaster {
    level: Level;
    alreadyClaimed: boolean;
    fid: string;
    isPowerUser: boolean;
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
