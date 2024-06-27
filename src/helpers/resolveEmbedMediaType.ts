import { FRAME_SERVER_URL } from '@/constants/index.js';
import { EmbedMediaType } from '@/providers/types/Firefly.js';

export function isValidPollFrameUrl(url: string): boolean {
    return url.startsWith(FRAME_SERVER_URL);
}

export const resolveEmbedMediaType = (type: EmbedMediaType, url: string) => {
    switch (type) {
        case EmbedMediaType.IMAGE:
            return 'Image';
        case EmbedMediaType.AUDIO:
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
