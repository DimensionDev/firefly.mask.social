import type { SocialSource } from '@/constants/enum.js';
import {
    MAX_FILE_SIZE_PER_GIF,
    MAX_FILE_SIZE_PER_IMAGE,
    MAX_FILE_SIZE_PER_VIDEO,
    SORTED_SOCIAL_SOURCES,
} from '@/constants/index.js';

function createPostFileSizeLimitGetter(limits: Record<SocialSource, number>) {
    return function (availableSources: SocialSource[]) {
        const sources = availableSources.length ? availableSources : SORTED_SOCIAL_SOURCES;
        return Math.min(...sources.map((source) => limits[source]));
    };
}

export const getPostImageSizeLimit = createPostFileSizeLimitGetter(MAX_FILE_SIZE_PER_IMAGE);

export const getPostGifSizeLimit = createPostFileSizeLimitGetter(MAX_FILE_SIZE_PER_GIF);

export const getPostVideoSizeLimit = createPostFileSizeLimitGetter(MAX_FILE_SIZE_PER_VIDEO);
