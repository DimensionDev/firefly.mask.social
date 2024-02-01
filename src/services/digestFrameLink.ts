interface FrameButton {
    index: 0 | 1 | 2 | 3;
    text: string;
    action: 'post' | 'post_redirect';
}

interface FrameImage {
    url: string;
    width: number;
    height: number;
}

export interface Frame {
    title: string;

    // fc:frame
    version: 'vNext';
    // fc:frame:image or og:image
    image: FrameImage;
    // fc:frame:post_url
    postUrl?: string;
    // fc:frame:button:$idx and fc:frame:button:$idx:action
    buttons?: FrameButton[];
    // fc:frame:refresh_period
    refreshPeriod?: number;
}

export interface LinkDigest {
    frame: Frame;
}

export async function digestFrameLink(link: string, signal?: AbortSignal): Promise<Frame> {
    throw new Error('Not implemented');
}
