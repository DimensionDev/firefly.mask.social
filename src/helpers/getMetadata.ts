/* cspell:disable */

import type { Document } from 'linkedom';

export const getTitle = (document: Document): string | null => {
    const lens =
        document.querySelector('meta[name="lens:title"]') || document.querySelector('meta[property="lens:title"]');
    const og = document.querySelector('meta[name="og:title"]') || document.querySelector('meta[property="og:title"]');
    const twitter =
        document.querySelector('meta[name="twitter:title"]') ||
        document.querySelector('meta[property="twitter:title"]');
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
};

export const getDescription = (document: Document): string | null => {
    const lens =
        document.querySelector('meta[name="lens:description"]') ||
        document.querySelector('meta[property="lens:description"]');
    const og =
        document.querySelector('meta[name="og:description"]') ||
        document.querySelector('meta[property="og:description"]');
    const twitter =
        document.querySelector('meta[name="twitter:description"]') ||
        document.querySelector('meta[property="twitter:description"]');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
};

export const getSite = (document: Document): string | null => {
    const lens =
        document.querySelector('meta[name="lens:site"]') || document.querySelector('meta[property="lens:site"]');
    const og =
        document.querySelector('meta[name="og:site_name"]') || document.querySelector('meta[property="og:site_name"]');
    const twitter =
        document.querySelector('meta[name="twitter:site"]') || document.querySelector('meta[property="twitter:site"]');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
};

export const getImage = (document: Document): string | null => {
    const lens =
        document.querySelector('meta[name="lens:image"]') || document.querySelector('meta[property="lens:image"]');
    const og = document.querySelector('meta[name="og:image"]') || document.querySelector('meta[property="og:image"]');
    const twitter =
        document.querySelector('meta[name="twitter:image"]') ||
        document.querySelector('meta[name="twitter:image:src"]') ||
        document.querySelector('meta[property="twitter:image"]') ||
        document.querySelector('meta[property="twitter:image:src"]');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
};

export const getEmbedUrl = (document: Document): string | null => {
    const lens =
        document.querySelector('meta[name="lens:player"]') || document.querySelector('meta[property="lens:player"]');
    const og =
        document.querySelector('meta[name="og:video:url"]') ||
        document.querySelector('meta[name="og:video:secure_url"]') ||
        document.querySelector('meta[property="og:video:url"]') ||
        document.querySelector('meta[property="og:video:secure_url"]');
    const twitter =
        document.querySelector('meta[name="twitter:player"]') ||
        document.querySelector('meta[property="twitter:player"]');

    if (lens) {
        return lens.getAttribute('content');
    } else if (og) {
        return og.getAttribute('content');
    } else if (twitter) {
        return twitter.getAttribute('content');
    }

    return null;
};

export const getIsLarge = (document: Document): boolean => {
    const lens =
        document.querySelector('meta[name="lens:card"]') || document.querySelector('meta[property="lens:card"]');
    const twitter =
        document.querySelector('meta[name="twitter:card"]') || document.querySelector('meta[property="twitter:card"]');

    const largeTypes = ['summary_large_image', 'player'];

    if (lens) {
        const card = lens.getAttribute('content') || '';
        return largeTypes.includes(card);
    } else if (twitter) {
        const card = twitter.getAttribute('content') || '';
        return largeTypes.includes(card);
    }

    return false;
};

export const generateIframe = (embedUrl: string | null, url: string): string | null => {
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
};
