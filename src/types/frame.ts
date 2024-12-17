/* cspell:disable */

import type { FrameProtocol } from '@/constants/enum.js';

export type Index = 1 | 2 | 3 | 4;

export enum ActionType {
    Post = 'post',
    PostRedirect = 'post_redirect',
    Link = 'link',
    Mint = 'mint',
    Transaction = 'tx',
}

export interface FrameInput {
    label: string;
    placeholder?: string;
}

export interface FrameButton {
    index: Index;
    text: string;
    action: ActionType;
    // action target URL
    target?: string;
    // send signature packet to, overrides fc:frame:post_url
    postUrl?: string;
}

export interface FrameImage {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
}

export interface FrameV1 {
    url: string;
    // frame title
    title: string;
    // fc:frame
    version: 'vNext';
    // fc:frame:image or og:image
    image: FrameImage;
    // fc:frame:post_url
    postUrl: string;
    // fc:frame:input:text
    input: FrameInput | null;
    // fc:frame:button:$idx and fc:frame:button:$idx:action
    buttons: FrameButton[];
    // fc:frame:refresh_period
    refreshPeriod: number;
    // fc:frame:aspect_ratio
    aspectRatio?: '1.91:1' | '1:1';
    // fc:frame:state
    state?: string;
    // frame client protocol
    protocol?: FrameProtocol;
}

export interface FrameV2 {
    x_url: string;

    // Frame spec version. Required.
    // Example: "next"
    version: Omit<string, 'next'> | 'next';

    // Frame image.
    // Max 512 characters.
    // Image must be 3:2 aspect ratio and less than 10 MB.
    // Example: "https://yoink.party/img/start.png"
    imageUrl: string;

    // Button attributes
    button: {
        // Button text.
        // Max length of 32 characters.
        // Example: "Yoink Flag"
        title: string;

        // Action attributes
        action: {
            // Action type. Must be "launch_frame".
            type: 'launch_frame';

            // App name
            // Max length of 32 characters.
            // Example: "Yoink!"
            name: string;

            // Frame launch URL.
            // Max 512 characters.
            // Example: "https://yoink.party/"
            url: string;

            // Splash image URL.
            // Max 512 characters.
            // Image must be 200x200px and less than 1MB.
            // Example: "https://yoink.party/img/splash.png"
            splashImageUrl: string;

            // Hex color code.
            // Example: "#eeeee4"
            splashBackgroundColor: string;
        };
    };
}

export type Frame = FrameV1 | FrameV2;

/**
 * Supported chain IDs by Frame
 * Learn more: https://docs.farcaster.xyz/developers/frames/spec
 */
export enum ChainId {
    Ethereum = 1,
    Polygon = 137,
    Arbitrum = 42161,
    Base = 8453,
    Base_Sepolia = 84532,
    Gnosis = 100,
    Optimism = 10,
    Zora = 7777777,
}

export enum MethodType {
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
}

export interface LinkDigestedResponse<T = Frame> {
    frame: T | null;
}

export interface RedirectUrlResponse {
    redirectUrl: string;
}
