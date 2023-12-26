import { Popover, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { type ChangeEvent, Fragment, useRef } from 'react';
import { useAsyncFn } from 'react-use';

import ImageIcon from '@/assets/image.svg';
import VideoIcon from '@/assets/video.svg';
import { SocialPlatform } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { useComposeStateStore } from '@/store/useComposeStore.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';

interface MediaProps {
    close: () => void;
}
export default function Media({ close }: MediaProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();
    const { video, updateVideo, images, updateImages, availableSources } = useComposeStateStore();

    const maxImageCount = currentFarcasterProfile && availableSources.includes(SocialPlatform.Farcaster) ? 2 : 4;
    const [, handleImageChange] = useAsyncFn(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files && files.length > 0) {
                updateImages((images) => {
                    if (images.length === maxImageCount) return images;
                    return [...images, ...[...files].map((file) => ({ file }))].slice(0, maxImageCount);
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
            <Popover.Panel
                static
                className=" absolute bottom-full left-0 z-50 flex w-[280px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] text-main shadow-popover"
            >
                <div
                    className={classNames(
                        'flex h-8 items-center gap-2',
                        images.length >= maxImageCount ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-bg',
                    )}
                    onClick={() => {
                        if (images.length < maxImageCount) {
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
                    className="hidden"
                    onChange={handleImageChange}
                />

                <div className=" h-px bg-line" />

                <div
                    className={classNames(
                        'flex h-8 items-center gap-2',
                        video ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-bg',
                    )}
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
