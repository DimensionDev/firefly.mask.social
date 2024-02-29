import { canParseURL } from '@/helpers/canParseURL.js';

export function getResourceType(urlString: string) {
    let fileExtension;

    if (typeof window !== 'undefined') {
        if (!canParseURL(urlString)) return;
        const parsedUrl = new URL(urlString);
        fileExtension = parsedUrl.pathname.split('.').pop()?.toLowerCase();
    } else if (typeof require === 'function') {
        const path = require('path');
        const url = require('url');

        const parsedUrl = url.parse(urlString);
        fileExtension = path.extname(parsedUrl.pathname).slice(1).toLowerCase();
    } else {
        throw new Error('Unsupported environment');
    }

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        return 'Image';
    } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
        return 'Video';
    } else if (['mp3'].includes(fileExtension)) {
        return 'Audio';
    } else {
        return;
    }
}
