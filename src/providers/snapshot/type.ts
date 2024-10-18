import type { Address } from 'viem';

import type { SnapshotState } from '@/constants/enum.js';

export type SnapshotChoice = number[] | { [key: string]: number } | number | string;

export type SnapshotProposal = {
    title: string;
    id: string;
    author: string;
    body: string;
    created: number;
    start: number;
    end: number;
    link: string;
    snapshot: number;
    state: SnapshotState;
    symbol: string;
    votes: number;
    type: string;
    choices: string[];
    scores: number[];
    scores_by_strategy: number[][];
    scores_total: number;
    scores_updated: number;
    plugins: Record<string, unknown>;
    network: string;
    strategies: SnapshotStrategy[];
    privacy?: string;
    currentUserChoice?: SnapshotChoice;
    space: {
        id: string;
        name: string;
    };
};

export type SnapshotVote = {
    ipfs: string;
    voter: string;
    choice: SnapshotChoice;
    vp: number;
    vp_by_strategy: number[];
    reason: string;
    created: number;
    voterDetail?: SnapshotUser;
    proposal: {
        choices: string[];
        symbol: string;
        id: string;
        type: string;
    };
};

export type SnapshotUser = {
    about: string;
    avatar: string;
    created: number;
    id: string;
    name: string;
};

export interface SnapshotVotes {
    data: {
        votes: SnapshotVote[];
    };
}

export interface SnapshotUsers {
    data: {
        users: SnapshotUser[];
    };
}

export interface SnapshotStrategy {
    name: string;
    network: string;
    params: {
        graphs?: {
            [key: string]: string;
        };
        symbol: string;
        strategies?: Array<{
            name: string;
            params: {
                symbol: string;
                address: string;
                decimals: number;
            };
            network: number;
        }>;
        args?: string[];
        address?: string;
        decimals?: number;
        methodABI?: {
            name: string;
            type: string;
            inputs: Array<{
                name: string;
                type: string;
                internalType: string;
            }>;
            outputs: Array<{
                name: string;
                type: string;
                internalType: string;
            }>;
            stateMutability: string;
        };
    };
}

export const voteTypes = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'string' },
        { name: 'choice', type: 'uint32' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
};

export const voteStringTypes = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'string' },
        { name: 'choice', type: 'string' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
};

export const vote2Types = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'bytes32' },
        { name: 'choice', type: 'uint32' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
};

export const voteArray2Types = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'bytes32' },
        { name: 'choice', type: 'uint32[]' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
};

export const voteString2Types = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'bytes32' },
        { name: 'choice', type: 'string' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
};

export const voteArrayTypes = {
    Vote: [
        { name: 'from', type: 'address' },
        { name: 'space', type: 'string' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'proposal', type: 'string' },
        { name: 'choice', type: 'uint32[]' },
        { name: 'reason', type: 'string' },
        { name: 'app', type: 'string' },
        { name: 'metadata', type: 'string' },
    ],
};

export type SnapshotActivity = {
    proposal_id: string;
    proposal?: SnapshotProposal;
    author: {
        /** Wallet address */
        id: Address;
        handle: string;
        avatar: string;
        isFollowing: boolean;
        isMuted: boolean;
    };
    type: 'vote';
    id: string;
    timestamp: number;
    choice: SnapshotChoice;
    hash: string;
    related_urls: string[];
    hasBookmarked: boolean;
    fallback_content: {
        title: string;
        body: string;
    };
};
