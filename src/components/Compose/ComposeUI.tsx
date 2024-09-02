import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo } from 'react';
import { useAsyncFn } from 'react-use';

import { ComposeActions } from '@/components/Compose/ComposeActions/index.js';
import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { ComposeSend } from '@/components/Compose/ComposeSend.js';
import { ComposeThreadContent } from '@/components/Compose/ComposeThreadContent.js';
import { SchedulePostEntryButton } from '@/components/Compose/SchedulePostEntryButton.js';
import { UploadDropArea } from '@/components/Compose/UploadDropArea.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { isImageFileType } from '@/helpers/isImageFileType.js';
import { isVideoFileType } from '@/helpers/isVideoFileType.js';
import { createLocalMediaObject } from '@/helpers/resolveMediaObjectUrl.js';
import { isValidPostImage, isValidPostVideo } from '@/helpers/validatePostFile.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useComposeScheduleStateStore } from '@/store/useComposeScheduleStore.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

export function Title() {
    const { type } = useComposeStateStore();

    switch (type) {
        case 'compose':
            return <Trans>Compose</Trans>;
        case 'quote':
            return <Trans>Quote</Trans>;
        case 'reply':
            return <Trans>Reply</Trans>;
        default:
            safeUnreachable(type);
            return <Trans>Compose</Trans>;
    }
}

export const ComposeUI = memo(function ComposeUI() {
    const isMedium = useIsMedium();
    const { type, posts, updateVideo, updateImages } = useComposeStateStore();
    const { scheduleTime } = useComposeScheduleStateStore();

    const compositePost = useCompositePost();

    const availableSources = compositePost.availableSources;
    const maxImageCount = getCurrentPostImageLimits(type, availableSources);

    const [{ loading }, handleDropFiles] = useAsyncFn(
        async (files: File[]) => {
            const validFiles = files.filter((file) => isImageFileType(file.type));
            if (!validFiles.length) return;
            const images = validFiles.filter((file) => isImageFileType(file.type));
            const validImages = [...images].filter((file) => {
                const message = isValidPostImage(availableSources, file);
                if (message) {
                    enqueueErrorMessage(message);
                    return false;
                }
                return true;
            });
            updateImages((images) => {
                if (images.length === maxImageCount) return images;
                return [...images, ...validImages.map((file) => createLocalMediaObject(file))].slice(0, maxImageCount);
            });

            const video = validFiles.find((file) => isVideoFileType(file.type));
            if (video) {
                const videoMessage = await isValidPostVideo(availableSources, video);
                if (videoMessage) {
                    return enqueueErrorMessage(videoMessage);
                }
                updateVideo(createLocalMediaObject(video));
            }
        },
        [availableSources, maxImageCount, updateImages, updateVideo],
    );

    return (
        <>
            <div
                className={classNames(
                    'flex flex-col overflow-auto px-4 pb-4',
                    isMedium ? 'h-full' : 'max-h-[300px] min-h-[300px]',
                )}
            >
                <UploadDropArea
                    className="flex h-full flex-1 flex-col overflow-y-auto overflow-x-hidden rounded-lg border bg-bg px-4 py-[14px]"
                    loading={loading}
                    onDropFiles={handleDropFiles}
                >
                    {scheduleTime && env.external.NEXT_PUBLIC_SCHEDULE_POST === STATUS.Enabled ? (
                        <SchedulePostEntryButton showText />
                    ) : null}
                    {posts.length === 1 ? <ComposeContent post={compositePost} /> : <ComposeThreadContent />}
                </UploadDropArea>
            </div>

            <ComposeActions />

            {isMedium ? <ComposeSend /> : null}
        </>
    );
});
