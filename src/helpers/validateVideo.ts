import { type SocialSource } from '@/constants/enum.js';
import {
    getPostVideoDurationMax,
    getPostVideoDurationMin,
    getPostVideoHeightMax,
    getPostVideoHeightMin,
    getPostVideoWidthMax,
    getPostVideoWidthMin,
} from '@/helpers/getPostLimitation.js';
import { getVideoMetadata } from '@/helpers/getVideoMetadata.js';

export async function validateVideoDuration(availableSources: SocialSource[], file: File) {
    const minDuration = getPostVideoDurationMin(availableSources);
    const maxDuration = getPostVideoDurationMax(availableSources);

    const { duration } = await getVideoMetadata(file);

    return {
        isValid: duration >= minDuration && duration <= maxDuration,
        duration,
        minDuration,
        maxDuration,
    };
}

export async function validateVideoSize(availableSources: SocialSource[], file: File) {
    const minWidth = getPostVideoWidthMin(availableSources);
    const maxWidth = getPostVideoWidthMax(availableSources);
    const minHeight = getPostVideoHeightMin(availableSources);
    const maxHeight = getPostVideoHeightMax(availableSources);

    const { width, height } = await getVideoMetadata(file);

    return {
        isValid: width >= minWidth && width <= maxWidth && height >= minHeight && height <= maxHeight,
        width,
        height,
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
    };
}
