import type { Response } from '@/providers/types/Firefly.js';

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

export interface BnbBalance {
    address: string;
    balance: number;
    valid: boolean;
    level: Level;
}

export type CheckResponse = Response<{
    alreadyClaimed: boolean;
    level: Level;
    canClaim: boolean;
    claimCondition: string;
    x: X | null;
    bnbId: BnbId | null;
    bnbBalance: BnbBalance | null;
    firefly: Firefly | null;
    address: string;
    eventEnds: boolean;
}>;
