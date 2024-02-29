import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

export enum Theme {
    Mask = 'mask',
    Firefly = 'firefly',
    FireflyCoBranding = 'firefly-co-branding',
}

export enum TokenType {
    Fungible = 'fungible',
    NonFungible = 'non-fungible',
}

export enum UsageType {
    Cover = 'cover',
    Payload = 'payload',
}

export enum CoBrandType {
    None = 'none',
}

export interface Dimension {
    width: number;
    height: number;
}

export interface RedPacketPayload {
    publicKey?: string;
    payloadImage: string;
    claimRequirements: FireflyRedPacketAPI.StrategyPayload[];
}
