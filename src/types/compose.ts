export type ComposeType = 'compose' | 'quote' | 'reply';

export enum MediaSource {
    Local = 'local',
    Twimg = 'Twimg',
    IPFS = 'ipfs',
    Imgur = 'imgur',
    S3 = 's3',
    Giphy = 'giphy',
}

export interface MediaObject {
    id: string;
    file: File;
    mimeType: string;
    urls?: Partial<Record<MediaSource, string>>;
}
