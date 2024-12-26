import type { FrameContext } from '@farcaster/frame-host';

import type { PartialWith } from '@/types/index.js';

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
    CLOSE = 'close',
    SET_PRIMARY_BUTTON = 'setPrimaryButton',
    GET_FRAME_CONTEXT = 'getFrameContext',
    REQUEST = 'request',
}

export interface MentionProfile {
    platform_id: string;
    platform: Platform;
    handle: string;
    name: string;
    namespace: string;
    hit: boolean;
    score: number;
}

export interface Mention {
    content: string;
    profiles: MentionProfile[];
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
    [SupportedMethod.CLOSE]: {};
    [SupportedMethod.SET_PRIMARY_BUTTON]: {
        text: string;
        loading?: boolean;
        disabled?: boolean;
        hidden?: boolean;
    };
    [SupportedMethod.GET_FRAME_CONTEXT]: {};
    [SupportedMethod.REQUEST]: {
        method: string;
        params: unknown[];
    };
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
    [SupportedMethod.UPDATE_NAVIGATOR_BAR]: void;
    [SupportedMethod.OPEN_URL]: void;
    [SupportedMethod.BIND_WALLET]: string; // address
    [SupportedMethod.IS_TWITTER_USER_FOLLOWING]: StringifyBoolean;
    [SupportedMethod.FOLLOW_TWITTER_USER]: StringifyBoolean;
    [SupportedMethod.UPDATE_NAVIGATOR_BAR]: void;
    [SupportedMethod.OPEN_URL]: void;
    [SupportedMethod.LOGIN]: StringifyBoolean;
    [SupportedMethod.SHARE]: void;
    [SupportedMethod.COMPOSE]: void;
    [SupportedMethod.BACK]: void;
    [SupportedMethod.CLOSE]: void;
    [SupportedMethod.SET_PRIMARY_BUTTON]: void;
    [SupportedMethod.GET_FRAME_CONTEXT]: PartialWith<FrameContext, 'client'> & {
        frame: string;
    };
    [SupportedMethod.REQUEST]: unknown;
}

export type MethodItem<T extends SupportedMethod = SupportedMethod> = {
    type: 'method';
    name: T;
};
