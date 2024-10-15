import { v4 as uuid } from 'uuid';

import { FileMimeType, type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { SORTED_MEDIA_SOURCES } from '@/constants/index.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import type { IPFSResponse } from '@/services/uploadToIPFS.js';
import type { TwitterMediaResponse } from '@/services/uploadToTwitter.js';
import { type MediaObject, MediaSource } from '@/types/compose.js';
import type { IGif } from '@/types/giphy.js';

export function createLocalMediaObject(file: File): MediaObject {
    return {
        id: uuid(),
        file,
        mimeType: file.type,
        urls: {
            [MediaSource.Local]: URL.createObjectURL(file),
        },
    };
}

export function createGiphyMediaObject(gif: IGif): MediaObject {
    return {
        id: gif.id.toString(),
        file: new File([], gif.title, { type: FileMimeType.GIF }),
        mimeType: FileMimeType.GIF,
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
        urls: {
            [MediaSource.IPFS]: ipfs.uri,
        },
    };
}

export function createTwitterMediaObject(twitterRes: TwitterMediaResponse, media: MediaObject): MediaObject {
    return {
        ...media,
        file: twitterRes.file,
        mimeType: twitterRes.file.type,
        uploadIds: {
            [MediaSource.Twimg]: twitterRes.media_id_string,
        },
    };
}

function resolveMediaObjectBy(key: 'urls' | 'uploadIds') {
    return function (media: MediaObject | null, sources = SORTED_MEDIA_SOURCES) {
        if (!media) return '';
        // the first source that has a url will be used as the preview
        const source = sources.find((x) => !!media[key]?.[x]);
        return source ? media[key]?.[source] ?? '' : '';
    };
}

export const resolveMediaObjectUrl = resolveMediaObjectBy('urls');
export const resolveMediaObjectUploadId = resolveMediaObjectBy('uploadIds');

const resolveImageSources = createLookupTableResolver<SocialSource, MediaSource[]>(
    {
        [Source.Lens]: [MediaSource.IPFS, MediaSource.S3, MediaSource.Giphy],
        [Source.Farcaster]: [MediaSource.S3, MediaSource.Giphy],
        [Source.Twitter]: [MediaSource.Twimg],
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

const resolveVideoSources = createLookupTableResolver<SocialSource, MediaSource[]>(
    {
        [Source.Lens]: [MediaSource.S3],
        [Source.Farcaster]: [MediaSource.S3],
        [Source.Twitter]: [MediaSource.Twimg],
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

export function resolveImageUrl(source: SocialSource, media: MediaObject | null) {
    return resolveMediaObjectUrl(media, resolveImageSources(source));
}

export function resolveVideoUrl(source: SocialSource, media: MediaObject | null) {
    return resolveMediaObjectUrl(media, resolveVideoSources(source));
}

export function resolveUploadId(source: SocialSource, media: MediaObject | null) {
    return resolveMediaObjectUploadId(media, resolveImageSources(source));
}
