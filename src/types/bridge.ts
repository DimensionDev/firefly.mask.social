export enum Theme {
    Auto = 'auto',
    Light = 'light',
    Dark = 'dark',
}
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
    GET_AUTHORIZATION = 'getAuthorization',
    GET_THEME = 'getTheme',
    GET_LANGUAGE = 'getLanguage',
    GET_WALLET_ADDRESS = 'getWalletAddress',
    CONNECT_WALLET = 'connectWallet',
    OPEN_URL = 'openUrl',
    LOGIN = 'login',
    SHARE = 'share',
    COMPOSE = 'compose',
    BACK = 'back',
}

export interface RequestArguments {
    [SupportedMethod.GET_SUPPORTED_METHODS]: {};
    [SupportedMethod.GET_AUTHORIZATION]: {};
    [SupportedMethod.GET_THEME]: {};
    [SupportedMethod.GET_LANGUAGE]: {};
    [SupportedMethod.GET_WALLET_ADDRESS]: {
        type: Network;
    };
    [SupportedMethod.CONNECT_WALLET]: {
        type: Network;
    };
    [SupportedMethod.OPEN_URL]: {
        url: string;
    };
    [SupportedMethod.LOGIN]: {
        platform: Platform;
    };
    [SupportedMethod.SHARE]: {
        text: string;
    };
    [SupportedMethod.COMPOSE]: {
        text: string;
    };
    [SupportedMethod.BACK]: {};
}

export interface RequestResult {
    [SupportedMethod.GET_SUPPORTED_METHODS]: SupportedMethod[];
    [SupportedMethod.GET_AUTHORIZATION]: string;
    [SupportedMethod.GET_THEME]: Theme;
    [SupportedMethod.GET_LANGUAGE]: string;
    [SupportedMethod.GET_WALLET_ADDRESS]: string[];
    [SupportedMethod.CONNECT_WALLET]: string;
    [SupportedMethod.OPEN_URL]: void;
    [SupportedMethod.LOGIN]: {
        success: 'true' | 'false';
    };
    [SupportedMethod.SHARE]: void;
    [SupportedMethod.COMPOSE]: void;
    [SupportedMethod.BACK]: void;
}

export type MethodItem<T extends SupportedMethod = SupportedMethod> = {
    type: 'method';
    name: T;
};
