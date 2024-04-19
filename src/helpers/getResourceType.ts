import { parseURL } from '@/helpers/parseURL.js';

export function getResourceType(urlString: string) {
    let fileExtension;
    let parsedUrl;
    if (typeof window !== 'undefined') {
        parsedUrl = parseURL(urlString);
        fileExtension = parsedUrl?.pathname.split('.').pop()?.toLowerCase();
    } else if (typeof require === 'function') {
        const path = require('path');
        const url = require('url');

        parsedUrl = url.parse(urlString);
        fileExtension = path.extname(parsedUrl.pathname).slice(1).toLowerCase();
    } else {
        throw new Error('Unsupported environment');
    }

    // TODO Temporary solution for https://mask.atlassian.net/browse/FW-755
    if (['imagedelivery.net'].includes(parsedUrl.hostname)) {
        return 'Image';
    }

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        return 'Image';
    } else if (['mp4', 'webm', 'ogg', 'm3u8'].includes(fileExtension)) {
        return 'Video';
    } else if (['mp3'].includes(fileExtension)) {
        return 'Audio';
    } else {
        return;
    }
}
