import type { FarcasterNetwork } from '@farcaster/hub-web';

export type Index = 1 | 2 | 3 | 4;

export enum ActionType {
    Post = 'post',
    PostRedirect = 'post_redirect',
}

export interface FrameInput {
    label: string;
    placeholder?: string;
}

export interface FrameButton {
    index: Index;
    text: string;
    action: ActionType;
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
}

export interface LinkDigested {
    frame: Frame;
}

export interface FrameSignaturePacket {
    untrustedData: {
        fid: number;
        url: string;
        messageHash: string;
        timestamp: number;
        network: FarcasterNetwork;
        buttonIndex: number;
        inputText?: string;
        castId: {
            fid: number;
            hash: string;
        };
    };
    trustedData: {
        messageBytes: string;
    };
}
