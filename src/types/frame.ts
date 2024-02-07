export type Index = 1 | 2 | 3 | 4;

export enum ActionType {
    Post = 'post',
    PostRedirect = 'post_redirect',
    Link = 'Link',
}

export interface FrameInput {
    label: string;
    placeholder?: string;
}

interface FrameButtonBase {
    index: Index;
    text: string;
}

interface FrameButtonPost extends FrameButtonBase {
    action: ActionType.Post | ActionType.PostRedirect;
}

interface FrameButtonLink extends FrameButtonBase {
    action: ActionType.Link;
    // action target URL
    target: string;
}

export type FrameButton = FrameButtonPost | FrameButtonLink;

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
