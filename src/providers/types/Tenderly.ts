import type { SimulateType } from '@/constants/enum.js';
import type { Response } from '@/providers/types/Firefly.js';

export interface SimulateRequest {
    chain_id: number;
    from_address: string;
    to_address: string;
    input_data?: string;
    value?: string;
    url?: string;
    blockNumber?: number;
}

export type AssetChange = {
    amount: string;
    dollar_value: string;
    raw_amount: string;
    from?: string;
    to?: string;
    token_id?: string;
    type: string;
    token_info?: {
        decimals: number;
        dollar_value: string;
        logo: string;
        name: string;
        standard: string;
        symbol: string;
        type: string;
        contract_address?: string;
    };
};

export type SimulateResponse = Response<{
    status: boolean;
    gasUsed: number;
    assetChanges: AssetChange[];
    balanceChanges: string[];
    errorMessage: string;
    errorMessageDetails: string;
    method: SimulateType;
    extInfo?: {
        approveTokenCount: number;
        approveTokenSymbol: string;
    };
    fee?: {
        value: string;
        symbol: string;
    };
}>;

export type SimulationOptions = {
    chainId: number;
    type?: SimulateType;
    url?: string;
    transaction?: {
        to?: string | null;
        value?: bigint;
        data?: string;
    };
};
