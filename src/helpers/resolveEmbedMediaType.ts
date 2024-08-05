import { getResourceType } from '@/helpers/getResourceType.js';
import { isSameOriginUrl } from '@/helpers/isSameOriginUrl.js';
import { EmbedMediaType } from '@/providers/types/Firefly.js';
import { settings } from '@/settings/index.js';

export function isValidPollFrameUrl(url: string): boolean {
    return isSameOriginUrl(url, settings.FRAME_SERVER_URL);
}

export function resolveEmbedMediaType(url: string, type?: EmbedMediaType) {
    if (!type) return getResourceType(url);

    switch (type) {
        case EmbedMediaType.IMAGE:
            return 'Image';
        case EmbedMediaType.AUDIO:
            if (url.includes('m3u8')) return 'Video';
            return 'Audio';
        case EmbedMediaType.VIDEO:
            return 'Video';
        case EmbedMediaType.UNKNOWN:
            return 'Unknown';
        default:
            if (isValidPollFrameUrl(url)) return 'Poll';
            return;
    }
}
