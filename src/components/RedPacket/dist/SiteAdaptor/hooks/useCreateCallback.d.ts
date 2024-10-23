import type { HappyRedPacketV4 } from '@masknet/web3-contracts/types/HappyRedPacketV4.js';
import { type FungibleToken } from '@masknet/web3-shared-base';
import { type ChainId, SchemaType, type GasConfig } from '@masknet/web3-shared-evm';
export interface RedPacketSettings {
    shares: number;
    duration: number;
    isRandom: boolean;
    total: string;
    name: string;
    message: string;
    token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>;
}
export type ParamsObjType = {
    publicKey: string;
    shares: number;
    isRandom: boolean;
    duration: number;
    seed: string;
    message: string;
    name: string;
    tokenType: number;
    tokenAddress: string;
    total: string;
    token?: FungibleToken<ChainId, SchemaType.Native | SchemaType.ERC20>;
};
export declare function checkParams(paramsObj: ParamsObjType): boolean;
export type MethodParameters = Parameters<HappyRedPacketV4['methods']['create_red_packet']>;
interface CreateParams {
    gas: string | undefined;
    params: MethodParameters;
    paramsObj: ParamsObjType;
    gasError: Error | null;
}
export declare function useCreateParams(expectedChainId: ChainId, redPacketSettings: RedPacketSettings, version: number, publicKey: string): import("react-use/lib/useAsyncFn.js").AsyncState<CreateParams | null>;
export declare function useCreateCallback(expectedChainId: ChainId, redPacketSettings: RedPacketSettings, version: number, publicKey: string, gasOption?: GasConfig): import("react-use/lib/useAsyncFn.js").AsyncFnReturn<() => Promise<{
    hash: string;
    receipt: import("web3-core").TransactionReceipt;
    events: {
        [eventName: string]: import("web3-core").EventLog | undefined;
    };
} | {
    hash: string;
    receipt: never;
    events?: undefined;
} | undefined>>;
export {};
//# sourceMappingURL=useCreateCallback.d.ts.map