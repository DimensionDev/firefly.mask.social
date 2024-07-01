import { createLookupTableResolver } from '@masknet/shared-base';
import { v4 as uuid } from 'uuid';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
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
        urls: {
            [MediaSource.Local]: URL.createObjectURL(file),
        },
    };
}

export function createGiphyMediaObject(gif: IGif): MediaObject {
    return {
        id: gif.id.toString(),
        file: new File([], gif.title, { type: 'image/gif' }),
        mimeType: 'image/gif',
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
        id: twitterRes.media_id_string,
        file: twitterRes.file,
        mimeType: twitterRes.file.type,
    };
}

export function resolveMediaObjectUrl(media: MediaObject | null, sources = SORTED_MEDIA_SOURCES) {
    if (!media) return '';
    // the first source that has a url will be used as the preview
    const source = sources.find((x) => !!media.urls?.[x]);
    return source ? media.urls?.[source] ?? '' : '';
}

const resolveImageSources = createLookupTableResolver<SocialSource, MediaSource[]>(
    {
        [Source.Lens]: [MediaSource.IPFS, MediaSource.Giphy],
        [Source.Farcaster]: [MediaSource.S3, MediaSource.Giphy],
        [Source.Twitter]: [MediaSource.Twimg],
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

const resolveVideoSources = createLookupTableResolver<SocialSource, MediaSource[]>(
    {
        [Source.Lens]: [MediaSource.IPFS],
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
