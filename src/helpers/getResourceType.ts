import { isValidPollFrameUrl } from '@/helpers/isValidPollFrameUrl.js';
import { parseURL } from '@/helpers/parseURL.js';

export function getResourceType(urlString: string) {
    const parsedURL = parseURL(urlString);
    if (!parsedURL) return;

    const fileExtension = parsedURL?.pathname.split('.').pop()?.toLowerCase();
    if (!fileExtension) return;

    // TODO Temporary solution for https://mask.atlassian.net/browse/FW-755
    if (['imagedelivery.net'].includes(parsedURL.hostname)) {
        return 'Image';
    }

    if (['png', 'jpeg', 'gif', 'webp', 'bmp', 'jpg'].includes(fileExtension)) {
        return 'Image';
    } else if (['mp4', 'webm', 'ogg', 'm3u8'].includes(fileExtension)) {
        return 'Video';
    } else if (['mp3'].includes(fileExtension)) {
        return 'Audio';
    } else if (isValidPollFrameUrl(parsedURL.origin)) {
        return 'Poll';
    } else {
        return;
    }
}
