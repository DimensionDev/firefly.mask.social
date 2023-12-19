import { Popover, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { type ChangeEvent, Fragment, useRef } from 'react';
import { useAsyncFn } from 'react-use';

import ImageIcon from '@/assets/image.svg';
import VideoIcon from '@/assets/video.svg';
import { useCustomSnackbar } from '@/hooks/useCustomSnackbar.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';

interface MediaProps {
    close: () => void;
}
export default function Media({ close }: MediaProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const { video, images, updateVideo, updateImages } = useComposeStateStore();

    const enqueueSnackbar = useCustomSnackbar();

    const [, handleImageChange] = useAsyncFn(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files && files.length > 0) {
                updateImages(
                    [
                        ...images,
                        ...[...files].map((file) => ({
                            file,
                        })),
                    ].slice(0, currentFarcasterProfile ? 2 : 4),
                );
            }
            close();
        },
        [currentFarcasterProfile, images, close, updateImages],
    );

    const [, handleVideoChange] = useAsyncFn(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files && files.length > 0) {
                updateVideo({
                    file: files[0],
                });
            }
            close();
        },
        [close, updateVideo],
    );

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
            <Popover.Panel className=" absolute bottom-full left-0 z-50 flex w-[280px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] text-main shadow-popover">
                <div
                    className=" flex h-8 cursor-pointer items-center gap-2 hover:bg-bg"
                    onClick={() => {
                        if (images.length < (currentFarcasterProfile ? 2 : 4)) {
                            imageInputRef.current?.click();
                        }
                    }}
                >
                    <ImageIcon width={24} height={24} />
                    <span className=" font-bold">
                        <Trans>Image</Trans>
                    </span>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={imageInputRef}
                    className=" hidden"
                    onChange={handleImageChange}
                />

                <div className=" h-px bg-line" />

                <div
                    className=" flex h-8 cursor-pointer items-center gap-2 hover:bg-bg"
                    onClick={() => {
                        if (!video && !currentFarcasterProfile) {
                            videoInputRef.current?.click();
                        }
                    }}
                >
                    <VideoIcon width={24} height={24} />
                    <span className=" font-bold">
                        <Trans>Video</Trans>
                    </span>
                </div>

                <input
                    type="file"
                    accept="video/*"
                    ref={videoInputRef}
                    className=" hidden"
                    onChange={handleVideoChange}
                />
            </Popover.Panel>
        </Transition>
    );
}
