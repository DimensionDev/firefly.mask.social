import type { Profile } from '@/providers/types/Firefly.js';

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
    BIND_WALLET = 'bindWallet',
    IS_TWITTER_USER_FOLLOWING = 'isTwitterUserFollowing',
    FOLLOW_TWITTER_USER = 'followTwitterUser',
    UPDATE_NAVIGATOR_BAR = 'updateNavigatorBar',
    OPEN_URL = 'openUrl',
    LOGIN = 'login',
    SHARE = 'share',
    COMPOSE = 'compose',
    BACK = 'back',
}

export interface Mention {
    content: string;
    profiles: Profile[];
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
    [SupportedMethod.BIND_WALLET]: {
        type: Network;
    };
    [SupportedMethod.IS_TWITTER_USER_FOLLOWING]: {
        id: string;
    };
    [SupportedMethod.FOLLOW_TWITTER_USER]: {
        id: string; // e.g., 952921795316912133
    };
    [SupportedMethod.UPDATE_NAVIGATOR_BAR]: {
        show: boolean;
        title: string;
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
        activity: string;
        mentions: Mention[];
    };
    [SupportedMethod.BACK]: {};
}

type StringifyBoolean = 'true' | 'false';

export interface RequestResult {
    [SupportedMethod.GET_SUPPORTED_METHODS]: SupportedMethod[];
    [SupportedMethod.GET_AUTHORIZATION]: string;
    [SupportedMethod.GET_THEME]: Theme;
    [SupportedMethod.GET_LANGUAGE]: string;
    [SupportedMethod.GET_WALLET_ADDRESS]: string[];
    [SupportedMethod.CONNECT_WALLET]: string;
    [SupportedMethod.BIND_WALLET]: string; // address
    [SupportedMethod.IS_TWITTER_USER_FOLLOWING]: StringifyBoolean;
    [SupportedMethod.FOLLOW_TWITTER_USER]: StringifyBoolean;
    [SupportedMethod.UPDATE_NAVIGATOR_BAR]: void;
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
