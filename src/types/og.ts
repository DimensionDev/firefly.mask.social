import type { SocialSourceInURL } from '@/constants/enum.js';
import type { Cast } from '@/providers/types/Warpcast.js';
import type { Hex } from 'viem';

export interface OpenGraphImage {
    url: string;
    base64?: string;
    width?: number;
    height?: number;
}

export interface OpenGraph {
    type: 'website';
    url: string;
    favicon: string;
    title: string | null;
    description: string | null;
    site: string | null;
    image: OpenGraphImage | null;
    isLarge: boolean;
    html: string | null;
    locale: string | null;
}

export enum PayloadType {
    Mirror = 'Mirror',
    Farcaster = 'Farcaster',
    Post = 'Post',
}

export interface MirrorPayload {
    type: PayloadType.Mirror;
    address?: Hex;
    timestamp?: number;
    ens?: string;
    displayName?: string;
    body?: string;
    cover?: string;
}

export interface FarcasterPayload {
    type: PayloadType.Farcaster;
    cast: Cast;
}

export interface PostPayload {
    type: PayloadType.Post;
    id: string;
    source: SocialSourceInURL;
}

export interface ImageDigested {
    url: string;
    width: number;
    height: number;
    base64: string;
}

export interface LinkDigested {
    og: OpenGraph;
    payload?: MirrorPayload | FarcasterPayload | PostPayload | null;
}
