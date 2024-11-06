import type { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

export enum TokenType {
    Fungible = 'fungible',
    NonFungible = 'non-fungible',
}

export enum UsageType {
    Cover = 'cover',
    Payload = 'payload',
}

export interface RedPacketPayload {
    rpId: string;
    publicKey?: string;
    payloadImage: string;
    claimRequirements: FireflyRedPacketAPI.StrategyPayload[];
}
