/* cspell:disable */
import { safeUnreachable } from '@masknet/kit';
import urlcat from 'urlcat';

import { parseURL } from '@/helpers/parseURL.js';

// URLs that are manually picked to be embedded that dont have embed metatags
const pickUrlSites = ['open.spotify.com', 'kick.com', 'tiktok.com'];

const needClean = ['tiktok.com'];

const spotifyTrackUrlRegex = /^ht{2}ps?:\/{2}open\.spotify\.com\/track\/[\dA-Za-z]+(\?si=[\dA-Za-z]+)?$/;
const spotifyPlaylistUrlRegex = /^ht{2}ps?:\/{2}open\.spotify\.com\/playlist\/[\dA-Za-z]+(\?si=[\dA-Za-z]+)?$/;
const oohlalaUrlRegex = /^ht{2}ps?:\/{2}oohlala\.xyz\/playlist\/[\dA-Fa-f-]+(\?si=[\dA-Za-z]+)?$/;
const soundCloudRegex = /^ht{2}ps?:\/{2}soundcloud\.com(?:\/[\dA-Za-z-]+){2}(\?si=[\dA-Za-z]+)?$/;
const youtubeRegex = /^https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w-]+)(?:\?.*)?$/;
const tapeRegex = /^https?:\/\/tape\.xyz\/watch\/[\dA-Za-z-]+(\?si=[\dA-Za-z]+)?$/;
const twitchRegex = /^https?:\/\/www\.twitch\.tv\/videos\/[\dA-Za-z-]+$/;
const kickRegex = /^https?:\/\/kick\.com\/[\dA-Za-z-]+$/;
const tiktokUserVideoRegex = /^https?:\/\/(?:www\.)?tiktok\.com\/@.+\/video\/[\dA-Za-z-]+$/;
const tiktokApiRegex = /^https?:\/\/(?:www\.)?tiktok\.com\/player\/v1\/[\dA-Za-z-]+/;

const universalSize = `width="100%" height="415"`;

export const getPostIFrame = (embedUrl: string | null, url: string): string | null => {
    const parsedUrl = parseURL(url);

    if (!parsedUrl) return null;

    const hostname = parsedUrl.hostname.replace('www.', '');
    const pickedUrl = pickUrlSites.includes(hostname) ? url : embedUrl;
    // Remove query params from url
    const cleanedUrl = needClean.includes(hostname) ? (pickedUrl?.split('?')[0] as string) : url;

    if (!pickedUrl) {
        return null;
    }

    switch (hostname) {
        case 'youtube.com':
        case 'youtu.be': {
            if (youtubeRegex.test(cleanedUrl)) {
                return `<iframe src="${pickedUrl}" ${universalSize} allow="accelerometer; encrypted-media" allowfullscreen></iframe>`;
            }

            return null;
        }
        case 'tape.xyz': {
            if (tapeRegex.test(cleanedUrl)) {
                return `<iframe src="${pickedUrl}" ${universalSize} allow="accelerometer; encrypted-media" allowfullscreen></iframe>`;
            }

            return null;
        }
        case 'twitch.tv': {
            const twitchEmbedUrl = pickedUrl.replace(
                '&player=facebook&autoplay=true&parent=meta.tag',
                '&player=firefly&autoplay=false&parent=firefly.mask.social',
            );
            if (twitchRegex.test(cleanedUrl)) {
                return `<iframe src="${twitchEmbedUrl}" ${universalSize} allowfullscreen></iframe>`;
            }

            return null;
        }
        case 'kick.com': {
            const kickEmbedUrl = pickedUrl.replace('kick.com', 'player.kick.com');
            if (kickRegex.test(cleanedUrl)) {
                return `<iframe src="${kickEmbedUrl}" ${universalSize} allowfullscreen></iframe>`;
            }

            return null;
        }
        case 'open.spotify.com': {
            const spotifySize = `style="max-width: 100%;" width="100%"`;
            if (spotifyTrackUrlRegex.test(cleanedUrl)) {
                const spotifyUrl = pickedUrl.replace('/track', '/embed/track');
                return `<iframe src="${spotifyUrl}" ${spotifySize} height="155" allow="encrypted-media"></iframe>`;
            }

            if (spotifyPlaylistUrlRegex.test(cleanedUrl)) {
                const spotifyUrl = pickedUrl.replace('/playlist', '/embed/playlist');
                return `<iframe src="${spotifyUrl}" ${spotifySize} height="380" allow="encrypted-media"></iframe>`;
            }

            return null;
        }
        case 'soundcloud.com': {
            if (soundCloudRegex.test(cleanedUrl)) {
                return `<iframe src="${pickedUrl}" ${universalSize}></iframe>`;
            }

            return null;
        }
        case 'oohlala.xyz': {
            if (oohlalaUrlRegex.test(cleanedUrl)) {
                return `<iframe src="${pickedUrl}" ${universalSize}></iframe>`;
            }

            return null;
        }
        case 'tiktok.com': {
            if (tiktokApiRegex.test(cleanedUrl)) {
                return `<iframe src="${pickedUrl}" ${universalSize} allowfullscreen></iframe>`;
            }
            if (tiktokUserVideoRegex.test(cleanedUrl)) {
                const videoId = cleanedUrl.split('/video/')[1];
                const videoUrl = urlcat('https://www.tiktok.com/player/v1/:id', {
                    id: videoId,
                    music_info: 1,
                    description: 1,
                });
                return `<iframe src="${videoUrl}" ${universalSize} allowfullscreen></iframe>`;
            }
            return null;
        }
        default:
            safeUnreachable(hostname as never);
            return null;
    }
};
