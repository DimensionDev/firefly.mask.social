import type { SourceInURL } from '@/helpers/resolveSource.js';
import type { Cast } from '@/providers/types/Warpcast.js';

export enum OpenGraphPayloadSourceType {
    Mirror = 'Mirror',
    Farcaster = 'Farcaster',
    Post = 'Post',
}

export interface MirrorPayload {
    type: OpenGraphPayloadSourceType.Mirror;
    address?: `0x${string}`;
    timestamp?: number;
    ens?: string;
    displayName?: string;
    body?: string;
}

export interface FarcasterPayload {
    type: OpenGraphPayloadSourceType.Farcaster;
    cast: Cast;
}

export interface PostPayload {
    type: OpenGraphPayloadSourceType.Post;
    id: string;
    source: SourceInURL;
}
