import { safeUnreachable } from '@masknet/kit';

import type { IPFSResponse } from '@/services/uploadToIPFS.js';
import type { TwitterMediaResponse } from '@/services/uploadToTwitter.js';
import type { IGif } from '@/types/giphy.js';
import { type MediaObject, MediaObjectSource } from '@/types/index.js';

export function createLocalMediaObject(file: File): MediaObject {
    return {
        id: '',
        file,
        source: MediaObjectSource.local,
        url: '',
        mimeType: file.type,
    };
}

export function createGiphyMediaObject(gif: IGif): MediaObject {
    return {
        id: `${gif.id}`,
        file: new File([], gif.title, { type: 'image/gif' }),
        source: MediaObjectSource.giphy,
        url: gif.images.original.url,
        mimeType: 'image/gif',
    };
}

export function createS3MediaObject(url: string, oldMedia: MediaObject): MediaObject {
    return {
        ...oldMedia,
        url,
        source: MediaObjectSource.s3,
    };
}

export function createIPFSMediaObject(ipfs: IPFSResponse, oldMedia: MediaObject): MediaObject {
    return {
        ...oldMedia,
        url: ipfs.uri,
        mimeType: ipfs.mimeType,
        source: MediaObjectSource.ipfs,
    };
}

export function createTwitterMediaObject(twitterRes: TwitterMediaResponse): MediaObject {
    return {
        id: twitterRes.media_id_string,
        file: twitterRes.file,
        source: MediaObjectSource.imgur,
        url: '',
        mimeType: twitterRes.file.type,
    };
}

export function resolveMediaPreviewURL(media: MediaObject) {
    const fileSuffix = media.file.type.split('/')[1];
    switch (media.source) {
        case MediaObjectSource.local:
            return URL.createObjectURL(media.file);
        case MediaObjectSource.ipfs:
            return URL.createObjectURL(media.file);
        case MediaObjectSource.imgur:
            return `https://i.imgur.com/${media.id}.${fileSuffix}`;
        case MediaObjectSource.s3:
            return media.url;
        case MediaObjectSource.giphy:
            return media.url;
        default:
            safeUnreachable(media.source);
            return '';
    }
}
