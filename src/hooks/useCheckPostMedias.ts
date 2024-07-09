import { t } from '@lingui/macro';
import { useCallback } from 'react';

import { Source } from '@/constants/enum.js';
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
        if (availableSources.includes(Source.Farcaster)) {
            if (hasVideo) {
                enqueueErrorMessage(t`Failed to upload. Video is not supported yet`);
                return true;
            }
            const maxImageCount = getCurrentPostImageLimits(availableSources, type);
            if (imageCount > maxImageCount) {
                enqueueErrorMessage(t`Failed to upload. More than ${maxImageCount} images`);
                return true;
            }
        }
        return false;
    }, [availableSources, hasVideo, imageCount, type]);
}
