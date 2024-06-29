import { v4 as uuid } from 'uuid';

import { SORTED_MEDIA_SOURCES } from '@/constants/index.js';
import type { IPFSResponse } from '@/services/uploadToIPFS.js';
import type { TwitterMediaResponse } from '@/services/uploadToTwitter.js';
import { type MediaObject, MediaSource } from '@/types/compose.js';
import type { IGif } from '@/types/giphy.js';

export function createLocalMediaObject(file: File): MediaObject {
    return {
        id: uuid(),
        file,
        mimeType: file.type,
    };
}

export function createGiphyMediaObject(gif: IGif): MediaObject {
    return {
        id: uuid(),
        file: new File([], gif.title, { type: 'image/gif' }),
        mimeType: 'image/gif',
        ids: {
            [MediaSource.Giphy]: gif.id.toString(),
        },
        urls: {
            [MediaSource.Giphy]: gif.images.original.url,
        },
    };
}

export function createS3MediaObject(url: string, media: MediaObject): MediaObject {
    return {
        ...media,
        urls: {
            [MediaSource.S3]: url,
        },
    };
}

export function createIPFSMediaObject(ipfs: IPFSResponse, media: MediaObject): MediaObject {
    return {
        ...media,
        mimeType: ipfs.mimeType,
    };
}

export function createTwitterMediaObject(twitterRes: TwitterMediaResponse): MediaObject {
    return {
        id: uuid(),
        file: twitterRes.file,
        mimeType: twitterRes.file.type,
        ids: {
            [MediaSource.Twimg]: twitterRes.media_id_string,
        },
    };
}

export function resolveMediaObjectUrl(media: MediaObject, sources = SORTED_MEDIA_SOURCES) {
    return sources.reduce((previewUrl, source) => {
        // the first source that has a url will be used as the preview
        if (previewUrl) return previewUrl;
        if (media.urls?.[source]) return media.urls[source];
        return previewUrl;
    }, '');
}
