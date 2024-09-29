import { t } from '@lingui/macro';

import { FileMimeType, type SocialSource } from '@/constants/enum.js';
import { formatFileSize } from '@/helpers/formatFileSize.js';
import { getPostGifSizeLimit, getPostImageSizeLimit, getPostVideoSizeLimit } from '@/helpers/getPostLimitation.js';
import { isMediaFileType } from '@/helpers/isMediaFileType.js';
import { validateVideoDuration, validateVideoSize } from '@/helpers/validateVideo.js';

export async function isValidPostVideo(availableSources: SocialSource[], file: File) {
    const maxVideoSize = getPostVideoSizeLimit(availableSources);
    if (file.size > maxVideoSize) {
        return t`Failed to upload. Video size exceeds ${formatFileSize(maxVideoSize)}`;
    }

    const { isValid: isDurationValid, minDuration, maxDuration } = await validateVideoDuration(availableSources, file);
    if (!isDurationValid) {
        return t`Failed to upload. Video length exceeds ${minDuration}s ~ ${maxDuration}s`;
    }

    const {
        isValid: isSizeValid,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
    } = await validateVideoSize(availableSources, file);
    if (!isSizeValid) {
        return t`Failed to upload. Video size exceeds ${minWidth}x${minHeight} ~ ${maxWidth}x${maxHeight}`;
    }

    return '';
}

export function isValidPostImage(availableSources: SocialSource[], file: File) {
    const maxImageSize = getPostImageSizeLimit(availableSources);
    const maxGifSize = getPostGifSizeLimit(availableSources);

    const isGif = file.type === FileMimeType.GIF;
    const sizeLimit = isGif ? maxGifSize : maxImageSize;
    if (file.size > sizeLimit) {
        return isGif
            ? t`Failed to upload. Gif size exceeds ${formatFileSize(maxGifSize)}`
            : t`Failed to upload. Image size exceeds ${formatFileSize(maxImageSize)}`;
    }

    if (!isMediaFileType(file.type)) {
        return t`Failed to upload. Not a valid image type`;
    }

    return '';
}
