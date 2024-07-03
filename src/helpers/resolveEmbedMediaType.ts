import { FRAME_SERVER_URL } from '@/constants/index.js';
import { getResourceType } from '@/helpers/getResourceType.js';
import { EmbedMediaType } from '@/providers/types/Firefly.js';

export function isValidPollFrameUrl(url: string): boolean {
    return url.startsWith(FRAME_SERVER_URL);
}

export const resolveEmbedMediaType = (url: string, type?: EmbedMediaType) => {
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
};
