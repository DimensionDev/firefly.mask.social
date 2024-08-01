import { t } from '@lingui/macro';
import { formatFileSize } from '@masknet/kit';
import { useCallback } from 'react';

import { FileMimeType } from '@/constants/enum.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { getPostGifSizeLimit, getPostImageSizeLimit } from '@/helpers/getPostFileSizeLimit.js';
import { isValidFileType } from '@/helpers/isValidFileType.js';
import { createLocalMediaObject } from '@/helpers/resolveMediaObjectUrl.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function useAddImages() {
    const { type, updateImages } = useComposeStateStore();
    const { availableSources } = useCompositePost();

    return useCallback(
        (files: File[]) => {
            const maxImageCount = getCurrentPostImageLimits(type, availableSources);
            const maxImageSize = getPostImageSizeLimit(availableSources);
            const maxGifSize = getPostGifSizeLimit(availableSources);
            const shouldUploadFiles = files.filter((file) => {
                const sizeLimit = file.type === FileMimeType.GIF ? maxGifSize : maxImageSize;
                if (file.size > sizeLimit) {
                    enqueueErrorMessage(
                        t`The file "${file.name}" (${formatFileSize(file.size, false)}) exceeds the size limit (${formatFileSize(sizeLimit, false)}).`,
                    );
                    return false;
                }
                return isValidFileType(file.type);
            });
            updateImages((images) => {
                if (images.length === maxImageCount) return images;
                return [...images, ...shouldUploadFiles.map((file) => createLocalMediaObject(file))].slice(
                    0,
                    maxImageCount,
                );
            });
        },
        [availableSources, type, updateImages],
    );
}
