import type { SocialSource } from '@/constants/enum.js';
import { SORTED_SOCIAL_SOURCES } from '@/constants/index.js';
import {
    MAX_DURATION_PER_VIDEO,
    MAX_FILE_SIZE_PER_GIF,
    MAX_FILE_SIZE_PER_IMAGE,
    MAX_FILE_SIZE_PER_VIDEO,
    MAX_HEIGHT_PER_VIDEO,
    MAX_WIDTH_PER_VIDEO,
    MIN_DURATION_PER_VIDEO,
    MIN_HEIGHT_PER_VIDEO,
    MIN_WIDTH_PER_VIDEO,
} from '@/constants/limitation.js';

function createPostFileSizeLimitGetter(limits: Record<SocialSource, number>) {
    return function (availableSources: SocialSource[]) {
        const sources = availableSources.length ? availableSources : SORTED_SOCIAL_SOURCES;
        return Math.min(...sources.map((source) => limits[source]));
    };
}

export const getPostImageSizeLimit = createPostFileSizeLimitGetter(MAX_FILE_SIZE_PER_IMAGE);

export const getPostGifSizeLimit = createPostFileSizeLimitGetter(MAX_FILE_SIZE_PER_GIF);

export const getPostVideoSizeLimit = createPostFileSizeLimitGetter(MAX_FILE_SIZE_PER_VIDEO);

export const getPostVideoDurationMin = createPostFileSizeLimitGetter(MIN_DURATION_PER_VIDEO);

export const getPostVideoDurationMax = createPostFileSizeLimitGetter(MAX_DURATION_PER_VIDEO);

export const getPostVideoWidthMin = createPostFileSizeLimitGetter(MIN_WIDTH_PER_VIDEO);

export const getPostVideoWidthMax = createPostFileSizeLimitGetter(MAX_WIDTH_PER_VIDEO);

export const getPostVideoHeightMin = createPostFileSizeLimitGetter(MIN_HEIGHT_PER_VIDEO);

export const getPostVideoHeightMax = createPostFileSizeLimitGetter(MAX_HEIGHT_PER_VIDEO);
