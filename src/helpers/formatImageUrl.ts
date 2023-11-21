import { LENS_MEDIA_SNAPSHOT_URL } from '@/constants/index.js';

export function formatImageUrl(url: string, name?: string) {
    if (!url) {
        return '';
    }

    if (url.includes(LENS_MEDIA_SNAPSHOT_URL)) {
        const splitedUrl = url.split('/');
        const path = splitedUrl[splitedUrl.length - 1];

        return name ? `${LENS_MEDIA_SNAPSHOT_URL}/${name}/${path}` : url;
    }

    return url;
}
