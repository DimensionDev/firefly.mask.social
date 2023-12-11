import { Popover, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { type ChangeEvent, type Dispatch, Fragment, type SetStateAction, useCallback, useRef } from 'react';

import ImageIcon from '@/assets/image.svg';
import VideoIcon from '@/assets/video.svg';
import uploadToIPFS from '@/services/uploadToIPFS.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import type { IPFS_MediaObject } from '@/types/index.js';

interface MediaProps {
    type: 'compose' | 'quote' | 'reply';
    images: IPFS_MediaObject[];
    setImages: Dispatch<SetStateAction<IPFS_MediaObject[]>>;
    setLoading: (loading: boolean) => void;
    video: IPFS_MediaObject | null;
    setVideo: Dispatch<SetStateAction<IPFS_MediaObject | null>>;
}
export default function Media({ type, images, setImages, setLoading, video, setVideo }: MediaProps) {
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const videoInputRef = useRef<HTMLInputElement | null>(null);

    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const handleImageChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files && files.length > 0) {
                setLoading(true);
                const res = await uploadToIPFS([...files]);
                setImages((_images) =>
                    [..._images]
                        .concat(
                            res.map((ipfs, index) => ({
                                file: files[index],
                                ipfs,
                            })),
                        )
                        .slice(0, currentFarcasterProfile ? 2 : 4),
                );
                setLoading(false);
            }
        },
        [currentFarcasterProfile, setImages, setLoading],
    );

    const handleVideoChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files;

            if (files && files.length > 0) {
                setLoading(true);
                const res = await uploadToIPFS([...files]);
                setVideo({
                    file: files[0],
                    ipfs: res[0],
                });
                setLoading(false);
            }
        },
        [setLoading, setVideo],
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
            <Popover.Panel className=" absolute bottom-full right-0 z-50 flex w-[280px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] text-main shadow-popover">
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
