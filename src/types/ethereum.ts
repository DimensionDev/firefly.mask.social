import { EthereumMethodType } from '@masknet/web3-shared-evm';

export interface MethodItem {
    method: EthereumMethodType;
}

export interface RequestArguments {
    method: string;
    params: unknown[];
}
