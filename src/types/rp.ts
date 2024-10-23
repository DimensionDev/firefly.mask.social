import type { StrategyPayload } from '@/providers/types/RedPacket.js';

export enum TokenType {
    Fungible = 'fungible',
    NonFungible = 'non-fungible',
}

export enum UsageType {
    Cover = 'cover',
    Payload = 'payload',
}

export interface RedPacketPayload {
    publicKey?: string;
    payloadImage: string;
    claimRequirements: StrategyPayload[];
}
