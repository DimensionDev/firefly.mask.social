import type { SimulateType } from '@/constants/enum.js';
import type { Response } from '@/providers/types/Firefly.js';

export interface SimulateRequest {
    chain_id: number;
    from_address: string;
    to_address: string;
    input_data: string;
    value: string;
    url?: string;
    blockNumber?: number;
}

export type SimulateResponse = Response<{
    status: boolean;
    gasUsed: number;
    assetChanges: string[];
    balanceChanges: string[];
    errorMessage: string;
    errorMessageDetails: string;
    method: string;
}>;

export interface PaySimulation {
    type: SimulateType.Pay;
    data: {};
}

export interface SendSimulation {
    type: SimulateType.Send;
    data: {};
}

export interface ApproveSimulation {
    type: SimulateType.Approve;
    data: {};
}

export interface ReceiveSimulation {
    type: SimulateType.Receive;
    data: {};
}

export interface SignatureSimulation {
    type: SimulateType.Signature;
    data: {
        url: string;
    };
}

export interface UnknowSimulation {
    type: SimulateType.Unknown;
    data: {};
}

export type SimulationOptions =
    | PaySimulation
    | SendSimulation
    | ApproveSimulation
    | ReceiveSimulation
    | SignatureSimulation
    | UnknowSimulation;
