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
    // internal id
    id: string;
    file: File;
    mimeType: string;
    // id differentiates the media object from different sources
    ids?: Partial<Record<MediaSource, string>>;
    urls?: Partial<Record<MediaSource, string>>;
}
