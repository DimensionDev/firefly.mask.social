/* cspell:disable */

import { q } from '@/helpers/q.js';

export function getTitle(document: Document): string | null {
    const lens = q(document, 'lens:title');
    const og = q(document, 'og:title');
    const twitter = q(document, 'twitter:title');
    const other = document.querySelector('title');
    const domain = document.domain;

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    } else if (other) {
        return other.textContent;
    } else {
        return domain;
    }
}

export function getDescription(document: Document): string | null {
    const lens = q(document, 'lens:description');
    const og = q(document, 'og:description');
    const twitter = q(document, 'twitter:description');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
}

export function getSite(document: Document): string | null {
    const lens = q(document, 'lens:site');
    const og = q(document, 'og:site_name');
    const twitter = q(document, 'twitter:site');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
}

export function getImageUrl(document: Document): string | null {
    const lens = q(document, 'lens:image');
    const og = q(document, 'og:image');
    const twitter = q(document, 'twitter:image') || q(document, 'twitter:image:src');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
}

export function getEmbedUrl(document: Document): string | null {
    const lens = q(document, 'lens:player');
    const og = q(document, 'og:video:url') || q(document, 'og:video:secure_url');
    const twitter = q(document, 'twitter:player');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
}

export function getIsLarge(document: Document): boolean {
    const lens = q(document, 'lens:card');
    const twitter = q(document, 'twitter:card');

    const largeTypes = ['summary_large_image', 'player'];

    if (lens) {
        const card = lens.getAttribute('content') || '';
        return largeTypes.includes(card);
    } else if (twitter) {
        const card = twitter.getAttribute('content') || '';
        return largeTypes.includes(card);
    }

    return false;
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
