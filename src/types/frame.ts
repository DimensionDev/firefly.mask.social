/* cspell:disable */

import type { FrameProtocol } from "@/constants/enum.js";

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

export interface Frame {
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
    Degen = 666666666,
    Gnosis = 100,
    Optimism = 10,
    Zora = 7777777,
}

export enum MethodType {
    ETH_SEND_TRANSACTION = 'eth_sendTransaction',
    ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
}

export interface LinkDigestedResponse {
    frame: Frame;
}

export interface RedirectUrlResponse {
    redirectUrl: string;
}
