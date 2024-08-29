import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { FileMimeType, Source } from '@/constants/enum.js';
import { SUPPORTED_VIDEO_SOURCES } from '@/constants/index.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function useCheckPostMedias() {
    const { availableSources, images, video } = useCompositePost();
    const { type } = useComposeStateStore();
    const hasVideo = !!video;
    const imageCount = images.length;
    return useCallback(() => {
        if (availableSources.some((source) => !SUPPORTED_VIDEO_SOURCES.includes(source)) && hasVideo) {
            enqueueErrorMessage(t`Failed to upload. Video is not supported yet.`);
            return true;
        }

        if (availableSources.includes(Source.Twitter) && images.some((x) => x.mimeType === FileMimeType.WEBP)) {
            enqueueErrorMessage(t`Failed to upload. File type is not supported on X.`);
            return true;
        }

        const maxImageCount = getCurrentPostImageLimits(type, availableSources);
        if (imageCount > maxImageCount) {
            enqueueErrorMessage(t`Failed to upload. More than ${maxImageCount} images.`);
            return true;
        }

        return false;
    }, [availableSources, hasVideo, imageCount, type, images]);
}
