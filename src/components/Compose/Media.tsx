import { Popover, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { type ChangeEvent, Fragment, useRef } from 'react';
import { useAsyncFn } from 'react-use';

import ImageIcon from '@/assets/image.svg';
import VideoIcon from '@/assets/video.svg';
import { useAddImages } from '@/components/Compose/useAddImages.js';
import { useAddVideo } from '@/components/Compose/useAddVideo.js';
import { FileMimeType } from '@/constants/enum.js';
import { ALLOWED_MEDIA_MIMES, SUPPORTED_VIDEO_SOURCES } from '@/constants/index.js';
import { classNames } from '@/helpers/classNames.js';
import { getCurrentPostImageLimits } from '@/helpers/getCurrentPostImageLimits.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';

interface MediaProps {
    close: () => void;
}
export function Media({ close }: MediaProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const { type } = useComposeStateStore();
    const { availableSources, video, images } = useCompositePost();

    const maxImageCount = getCurrentPostImageLimits(type, availableSources);

    const addImages = useAddImages();
    const [, handleImageChange] = useAsyncFn(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files?.length) {
                addImages([...files]);
            }
            close();
        },
        [close, addImages],
    );

    const isMedium = useIsMedium();

    const addVideo = useAddVideo();
    const [, handleVideoChange] = useAsyncFn(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files?.length) {
                const file = files[0];
                addVideo(file);
            }
            close();
            return;
        },
        [close, addVideo],
    );

    const disabledVideo =
        !!video || images.length > 0 || availableSources.some((source) => !SUPPORTED_VIDEO_SOURCES.includes(source));
    const disableImage = images.length >= maxImageCount;

    const content = (
        <div>
            <div className="pb-2">
                <div
                    className={classNames(
                        'flex h-[30px] items-center gap-2 p-3',
                        disableImage ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-bg',
                    )}
                    onClick={() => {
                        if (!disabledVideo) {
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
                    accept={ALLOWED_MEDIA_MIMES.join(', ')}
                    multiple
                    ref={imageInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                />
            </div>
            <div className="pt-2">
                <div
                    className={classNames(
                        'flex h-[30px] items-center gap-2 p-3',
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
                    accept={FileMimeType.MP4}
                    ref={videoInputRef}
                    className="hidden"
                    onChange={handleVideoChange}
                />
            </div>
        </div>
    );

    if (isMedium)
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
                    className="absolute bottom-full left-0 z-50 w-[280px] -translate-y-3 rounded-lg bg-lightBottom py-3 text-medium text-main shadow-popover dark:bg-darkBottom"
                >
                    {content}
                </Popover.Panel>
            </Transition>
        );

    return <>{content}</>;
}
