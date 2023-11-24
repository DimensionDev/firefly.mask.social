import type { Cast } from '@/providers/types/Warpcast.js';

export enum OpenGraphPayloadSourceType {
    Mirror = 'Mirror',
    Farcaster = 'Farcaster',
}

export interface MirrorPayload {
    type: OpenGraphPayloadSourceType.Mirror;
    address?: `0x${string}`;
    timestamp?: number;
    ens?: string;
    displayName?: string;
}

export interface FarcasterPayload {
    type: OpenGraphPayloadSourceType.Farcaster;
    cast: Cast;
}
