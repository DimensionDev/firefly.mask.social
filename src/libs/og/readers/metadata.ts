/* cspell:disable */

import { getMetaContent } from '@/helpers/getMetaContent.js';

export function getTitle(document: Document): string | null {
    return (
        getMetaContent(document, 'lens:title') ||
        getMetaContent(document, 'og:title') ||
        getMetaContent(document, 'twitter:title') ||
        document.querySelector('title')?.textContent ||
        document.domain
    );
}

export function getDescription(document: Document): string | null {
    return (
        getMetaContent(document, 'lens:description') ||
        getMetaContent(document, 'og:description') ||
        getMetaContent(document, 'twitter:description') ||
        null
    );
}

export function getSite(document: Document): string | null {
    return (
        getMetaContent(document, 'lens:site') ||
        getMetaContent(document, 'og:site_name') ||
        getMetaContent(document, 'twitter:site') ||
        null
    );
}

export function getImageUrl(document: Document): string | null {
    return (
        getMetaContent(document, 'lens:image') ||
        getMetaContent(document, 'og:image') ||
        getMetaContent(document, 'twitter:image') ||
        getMetaContent(document, 'twitter:image:src') ||
        null
    );
}

export function getEmbedUrl(document: Document): string | null {
    return (
        getMetaContent(document, 'lens:player') ||
        getMetaContent(document, 'og:video:url') ||
        getMetaContent(document, 'og:video:secure_url') ||
        getMetaContent(document, 'twitter:player') ||
        null
    );
}

export function getIsLarge(document: Document): boolean {
    const lens = getMetaContent(document, 'lens:card');
    const twitter = getMetaContent(document, 'twitter:card');

    const largeTypes = ['summary_large_image', 'player'];

    if (lens) {
        return largeTypes.includes(lens);
    } else if (twitter) {
        return largeTypes.includes(twitter);
    } else {
        return false;
    }
}

export function generateIframe(embedUrl: string | null, url: string): string | null {
    const knownSites = ['youtube.com', 'youtu.be', 'tape.xyz', 'open.spotify.com', 'soundcloud.com', 'oohlala.xyz'];

    const pickUrlSites = ['open.spotify.com'];

    const spotifyTrackUrlRegex = /^ht{2}ps?:\/{2}open\.spotify\.com\/track\/[\dA-Za-z]+(\?si=[\dA-Za-z]+)?$/;
    const spotifyPlaylistUrlRegex = /^ht{2}ps?:\/{2}open\.spotify\.com\/playlist\/[\dA-Za-z]+(\?si=[\dA-Za-z]+)?$/;
    const oohlalaUrlRegex = /^ht{2}ps?:\/{2}oohlala\.xyz\/playlist\/[\dA-Fa-f-]+(\?si=[\dA-Za-z]+)?$/;
    const soundCloudRegex = /^ht{2}ps?:\/{2}soundcloud\.com(?:\/[\dA-Za-z-]+){2}(\?si=[\dA-Za-z]+)?$/;
    const youtubeRegex = /^https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]+)(?:\?.*)?$/;
    const tapeRegex = /^https?:\/\/tape\.xyz\/watch\/[\dA-Za-z-]+(\?si=[\dA-Za-z]+)?$/;

    const universalSize = `width="560" height="315"`;
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace('www.', '');
    const pickedUrl = pickUrlSites.includes(hostname) ? url : embedUrl;

    if (!knownSites.includes(hostname) || !pickedUrl) {
        return null;
    }

    switch (hostname) {
        case 'youtube.com':
        case 'youtu.be':
            if (youtubeRegex.test(url)) {
                return `<iframe src="${pickedUrl}" ${universalSize} allow="accelerometer; encrypted-media" allowfullscreen></iframe>`;
            }

            return null;
        case 'tape.xyz':
            if (tapeRegex.test(url)) {
                return `<iframe src="${pickedUrl}" ${universalSize} allow="accelerometer; encrypted-media" allowfullscreen></iframe>`;
            }

            return null;
        case 'open.spotify.com':
            const spotifySize = `style="max-width: 560px;" width="100%"`;
            if (spotifyTrackUrlRegex.test(url)) {
                const spotifyUrl = pickedUrl.replace('/track', '/embed/track');
                return `<iframe src="${spotifyUrl}" ${spotifySize} height="155" allow="encrypted-media"></iframe>`;
            }

            if (spotifyPlaylistUrlRegex.test(url)) {
                const spotifyUrl = pickedUrl.replace('/playlist', '/embed/playlist');
                return `<iframe src="${spotifyUrl}" ${spotifySize} height="380" allow="encrypted-media"></iframe>`;
            }

            return null;
        case 'soundcloud.com':
            if (soundCloudRegex.test(url)) {
                return `<iframe src="${pickedUrl}" ${universalSize}></iframe>`;
            }

            return null;
        case 'oohlala.xyz':
            if (oohlalaUrlRegex.test(url)) {
                return `<iframe src="${pickedUrl}" ${universalSize}></iframe>`;
            }

            return null;
        default:
            return `<iframe src="${pickedUrl}" width="560"></iframe>`;
    }
}
