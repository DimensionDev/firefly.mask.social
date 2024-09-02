import { t } from '@lingui/macro';
import { formatFileSize } from '@masknet/kit';

import { FileMimeType, type SocialSource } from '@/constants/enum.js';
import { getPostGifSizeLimit, getPostImageSizeLimit, getPostVideoSizeLimit } from '@/helpers/getPostFileSizeLimit.js';
import { isValidFileType } from '@/helpers/isValidFileType.js';
import { validateVideoDuration } from '@/helpers/validateVideoDuration.js';

export async function isValidPostVideo(availableSources: SocialSource[], file: File) {
    const maxVideoSize = getPostVideoSizeLimit(availableSources);
    const { isValid, maxDuration } = await validateVideoDuration(availableSources, file);
    if (!isValid) {
        return t`Failed to upload. Video length exceeds ${maxDuration}s`;
    }
    if (file.size > maxVideoSize) {
        return t`Failed to upload. Video size exceeds ${formatFileSize(maxVideoSize, false)}`;
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
            ? t`Failed to upload. Gif size exceeds ${formatFileSize(maxGifSize, false)}`
            : t`Failed to upload. Image size exceeds ${formatFileSize(maxImageSize, false)}`;
    }

    if (!isValidFileType(file.type)) {
        return t`Failed to upload. Not a valid image type`;
    }

    return '';
}
