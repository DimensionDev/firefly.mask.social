import { Trans } from '@lingui/macro';
import { safeUnreachable } from '@masknet/kit';
import { memo, useCallback } from 'react';

import { ComposeActions } from '@/components/Compose/ComposeActions/index.js';
import { ComposeContent } from '@/components/Compose/ComposeContent.js';
import { ComposeSend } from '@/components/Compose/ComposeSend.js';
import { ComposeThreadContent } from '@/components/Compose/ComposeThreadContent.js';
import { SchedulePostEntryButton } from '@/components/Compose/SchedulePostEntryButton.js';
import { UploadDropArea } from '@/components/Compose/UploadDropArea.js';
import { useAddImages } from '@/components/Compose/useAddImages.js';
import { useAddVideo } from '@/components/Compose/useAddVideo.js';
import { STATUS } from '@/constants/enum.js';
import { env } from '@/constants/env.js';
import { classNames } from '@/helpers/classNames.js';
import { isImageFileType } from '@/helpers/isImageFileType.js';
import { isVideoFileType } from '@/helpers/isVideoFileType.js';
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
    const { posts } = useComposeStateStore();
    const { scheduleTime } = useComposeScheduleStateStore();

    const compositePost = useCompositePost();

    const addImages = useAddImages();
    const addVideo = useAddVideo();
    const handleDropFiles = useCallback(
        (files: File[]) => {
            const validFiles = files.filter((file) => isImageFileType(file.type));
            if (!validFiles.length) return;
            const images = validFiles.filter((file) => isImageFileType(file.type));
            addImages(images);
            const video = validFiles.find((file) => isVideoFileType(file.type));
            if (video) addVideo(video);
        },
        [addImages, addVideo],
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
