import { parseUrl } from '@/helpers/parseUrl.js';
import { isValidPollFrameUrl } from '@/helpers/resolveEmbedMediaType.js';

export function getResourceType(urlString: string) {
    const parsedURL = parseUrl(urlString);
    if (!parsedURL) return;

    let fileExtension = parsedURL?.pathname.split('.').pop()?.toLowerCase();
    if (!fileExtension) return;

    // TODO Temporary solution for https://mask.atlassian.net/browse/FW-755
    if (['imagedelivery.net'].includes(parsedURL.hostname)) {
        return 'Image';
    }

    // cspell: disable-next-line
    if (['supercast.mypinata.cloud', 'cloudflare-ipfs.com'].includes(parsedURL.hostname)) {
        const fileName = parsedURL.searchParams.get('filename');
        const extension = fileName?.split('.').pop()?.toLowerCase();
        if (extension) fileExtension = extension;
    }

    if (['png', 'jpeg', 'gif', 'webp', 'bmp', 'jpg'].includes(fileExtension)) {
        return 'Image';
    } else if (['mp4', 'webm', 'ogg', 'm3u8', 'mov'].includes(fileExtension)) {
        return 'Video';
    } else if (['mp3'].includes(fileExtension)) {
        return 'Audio';
    } else if (isValidPollFrameUrl(parsedURL.origin)) {
        return 'Poll';
    } else {
        return;
    }
}
