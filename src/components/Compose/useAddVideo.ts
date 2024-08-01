import { t } from '@lingui/macro';
import { formatFileSize } from '@masknet/kit';
import { useCallback } from 'react';

import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getPostVideoSizeLimit } from '@/helpers/getPostFileSizeLimit.js';
import { createLocalMediaObject } from '@/helpers/resolveMediaObjectUrl.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function useAddVideo() {
    const { updateVideo } = useComposeStateStore();
    const { availableSources } = useCompositePost();

    return useCallback(
        (file: File) => {
            const maxVideoSize = getPostVideoSizeLimit(availableSources);
            if (file.size > maxVideoSize) {
                enqueueErrorMessage(
                    t`The video "${file.name}" (${formatFileSize(file.size, false)}) exceeds the size limit (${formatFileSize(maxVideoSize, false)}).`,
                );
                return false;
            }
            updateVideo(createLocalMediaObject(file));
            return;
        },
        [availableSources, updateVideo],
    );
}
