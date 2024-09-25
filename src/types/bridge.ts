export enum Platform {
    LENS = 'lens',
    FIREFLY = 'firefly',
    TWITTER = 'twitter',
    FARCASTER = 'farcaster',
}

export enum Network {
    All = 'all',
    EVM = 'evm',
    Solana = 'solana',
}

export enum SupportedMethod {
    GET_SUPPORTED_METHODS = 'getSupportMethod',
    GET_WALLET_ADDRESS = 'getWalletAddress',
    CONNECT_WALLET = 'connectWallet',
    LOGIN = 'login',
    SHARE = 'share',
    COMPOSE = 'compose',
}

export interface RequestArguments {
    [SupportedMethod.GET_SUPPORTED_METHODS]: {};
    [SupportedMethod.GET_WALLET_ADDRESS]: {
        type: Network;
    };
    [SupportedMethod.CONNECT_WALLET]: {
        type: Network;
    };
    [SupportedMethod.LOGIN]: {
        platform: Platform;
    };
    [SupportedMethod.SHARE]: {
        text: string;
    };
    [SupportedMethod.COMPOSE]: {
        text: string;
        platform: Platform;
        urls?: string[];
    };
}

export interface RequestResult {
    [SupportedMethod.GET_SUPPORTED_METHODS]: SupportedMethod[];
    [SupportedMethod.GET_WALLET_ADDRESS]: string[];
    [SupportedMethod.CONNECT_WALLET]: {
        walletAddress: string;
    };
    [SupportedMethod.LOGIN]: {
        success: 'true' | 'false';
    };
    [SupportedMethod.SHARE]: void;
    [SupportedMethod.COMPOSE]: void;
}

export interface HeaderItem {
    type: 'header';
    name: 'authorization' | 'x-theme' | 'x-language';
}

export type MethodItem<T extends SupportedMethod = SupportedMethod> = {
    type: 'method';
    name: T;
};
