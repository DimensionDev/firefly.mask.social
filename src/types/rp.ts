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
    publicKey?: string;
    payloadImage: string;
    claimRequirements: FireflyRedPacketAPI.StrategyPayload[];
}

export interface RedPacketMetadata {
    contract_address: string;
    contract_version: number;
    creation_time: number;
    duration: number;
    is_random: boolean;
    network: string;
    password: string;
    rpid: string;
    sender: { address: string; name: string; message: string };
    shares: number;
    token: { decimals: number; symbol: string; address: string; chainId: number };
    total: string;
}
