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
    title: string;
    description: string;
    author: string;
    avatar: string;
    timestamp: number;
}
