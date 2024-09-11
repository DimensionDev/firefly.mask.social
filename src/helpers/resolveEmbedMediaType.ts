import { FRAME_DEV_SERVER_URL, FRAME_SERVER_URL } from '@/constants/index.js';
import { getResourceType } from '@/helpers/getResourceType.js';
import { isRoutePathname } from '@/helpers/isRoutePathname.js';
import { isSameOriginUrl } from '@/helpers/isSameOriginUrl.js';
import { parseURL } from '@/helpers/parseURL.js';
import { EmbedMediaType } from '@/providers/types/Firefly.js';

const frameDomains = [
    FRAME_SERVER_URL,
    FRAME_DEV_SERVER_URL,
    'https://polls-canary.firefly.social',
    'https://polls.mask.social',
];

export function isValidPollFrameUrl(url: string): boolean {
    if (!frameDomains.some((domain) => isSameOriginUrl(url, domain))) return false;
    const parsed = parseURL(url);
    if (!parsed) return false;

    return isRoutePathname(parsed.pathname, '/polls/:id', true);
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
