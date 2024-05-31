import type { AbiItem } from 'viem';

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
}

export interface FrameImage {
    url: string;
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
}

export interface LinkDigested {
    frame: Frame;
}

/**
 * Supported chain IDs
 */
export enum ChainId {
    Ethereum = 1,
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
}

export interface TransactionParams {
    //  JSON ABI which must include encoded function type and should include potential error types. Can be empty.
    abi: AbiItem | AbiItem[];
    to: `0x${string}`;
    // value of ether to send with the transaction in wei. Optional.
    value?: string;
    data?: `0x${string}`;
}

export interface TransactionTargetResponse {
    // a CAIP-2 chain ID to identify the tx network
    chainId: `eip155:${ChainId}`;
    method: MethodType;
    // identifying client in calldata
    // learn more: https://www.notion.so/warpcast/Frame-Transactions-Public-9d9f9f4f527249519a41bd8d16165f73?pvs=4#c1c3182208ce4ae4a7ffa72129b9795a
    attribution?: boolean;
    params: TransactionParams;
}
