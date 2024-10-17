import type { LinkDigestType } from '@/constants/enum.js';
import type { Response } from '@/providers/types/Firefly.js';

export enum SnapshotState {
    Active = 'active',
    Closed = 'closed',
    Pending = 'pending',
}
export interface SnapshotProposal {
    title: string;
    id: string;
    author: string;
    body: string;
    created: number;
    platform: string;
    link: string;
    ext_param: {
        start: number;
        end: number;
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
        strategies: Array<{
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
        }>;
        space: {
            id: string;
            name: string;
        };
        displayInfo?: {
            ensHandle?: string;
            avatarUrl?: string;
        };
    };
}

export type SnapshotLinkDigestedResponse = Response<{
    type: LinkDigestType;
    link: string;
    snapshot?: SnapshotProposal;
}>;
