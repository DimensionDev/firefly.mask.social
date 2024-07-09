import { Popover, Transition } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import { type ChangeEvent, Fragment, useRef } from 'react';
import { useAsyncFn } from 'react-use';

import ImageIcon from '@/assets/image.svg';
import VideoIcon from '@/assets/video.svg';
import { Source } from '@/constants/enum.js';
import { ALLOWED_IMAGES_MIMES, FILE_MAX_SIZE_IN_BYTES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { enqueueErrorMessage } from '@/helpers/enqueueMessage.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { isValidFileType } from '@/helpers/isValidFileType.js';
import { createLocalMediaObject } from '@/helpers/resolveMediaObjectUrl.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface MediaProps {
    close: () => void;
}
export function Media({ close }: MediaProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const { type, updateVideo, updateImages } = useComposeStateStore();
    const { availableSources, video, images } = useCompositePost();

    const maxImageCount = getCurrentPostImageLimits(type, availableSources);

    const [, handleImageChange] = useAsyncFn(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files && files.length > 0) {
                const shouldUploadFiles = [...files].filter((file) => {
                    if (file.size > FILE_MAX_SIZE_IN_BYTES) {
                        enqueueErrorMessage(t`The file "${file.name}" exceeds the size limit.`);
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
            }
            close();
        },
        [maxImageCount, close, updateImages],
    );

    const [, handleVideoChange] = useAsyncFn(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files && files.length > 0) {
                updateVideo(createLocalMediaObject(files[0]));
            }
            close();
        },
        [close, updateVideo],
    );

    const disabledVideo =
        !!video ||
        availableSources.includes(Source.Farcaster) ||
        availableSources.includes(Source.Twitter) ||
        (availableSources.includes(Source.Lens) && images.length > 0);

    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-y-1"
        >
            <Popover.Panel
                static
                className="absolute bottom-full left-0 z-50 flex w-[280px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] text-main shadow-popover"
            >
                <div
                    className={classNames(
                        'flex h-8 items-center gap-2',
                        images.length >= maxImageCount ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-bg',
                    )}
                    onClick={() => {
                        if (images.length < maxImageCount) {
                            imageInputRef.current?.click();
                        }
                    }}
                >
                    <ImageIcon width={24} height={24} />
                    <span className="font-bold">
                        <Trans>Image</Trans>
                    </span>
                </div>

                <input
                    type="file"
                    accept={ALLOWED_IMAGES_MIMES.join(', ')}
                    multiple
                    ref={imageInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                />

                <div className="h-px bg-line" />

                <div
                    className={classNames(
                        'flex h-8 items-center gap-2',
                        disabledVideo ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-bg',
                    )}
                    onClick={() => {
                        if (disabledVideo) return;

                        videoInputRef.current?.click();
                    }}
                >
                    <VideoIcon width={24} height={24} />
                    <span className="font-bold">
                        <Trans>Video</Trans>
                    </span>
                </div>

                <input
                    type="file"
                    accept="video/mp4"
                    ref={videoInputRef}
                    className="hidden"
                    onChange={handleVideoChange}
                />
            </Popover.Panel>
        </Transition>
    );
}
