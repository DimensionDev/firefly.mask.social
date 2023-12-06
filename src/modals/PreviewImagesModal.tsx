import { Dialog, Transition } from '@headlessui/react';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { forwardRef, Fragment, useState } from 'react';
import { useStateList } from 'react-use';

import CloseIcon from '@/assets/close.svg';
import { PostActions } from '@/components/Actions/index.js';
import { Image } from '@/components/Image.js';
import type { SingletonModalRefCreator } from '@/maskbook/packages/shared-base/src/index.js';
import { useSingletonModal } from '@/maskbook/packages/shared-base-ui/src/index.js';
import type { Post } from '@/providers/types/SocialMedia.js';

export interface PreviewImagesModalOpenProps {
    images: string[];
    current: string;
    post: Post;
}

export const PreviewImagesModal = forwardRef<SingletonModalRefCreator<PreviewImagesModalOpenProps>>(
    function PreviewImagesModal(_, ref) {
        const [current, setCurrent] = useState<string>();
        const [post, setPost] = useState<Post | undefined>();
        const [images, setImages] = useState<string[]>([]);

        const { state, setState, prev, next, currentIndex } = useStateList(images);
        const isMultiple = images.length > 1;
        const isAtStart = currentIndex === 0;
        const isAtEnd = currentIndex === images.length - 1;

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen: (props) => {
                setImages(props.images);
                setCurrent(props.current);
                setPost(props.post);
            },
            onClose: () => {
                setCurrent(undefined);
                setPost(undefined);
                setImages([]);
            },
        });

        return (
            <Transition appear show={open} as={Fragment}>
                <Dialog as="div" className="relative z-[999]" onClose={() => dispatch?.close()}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/80" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="preview-actions flex transform flex-col items-center transition-all">
                                    <div className="mb-2 w-full">
                                        <CloseIcon
                                            width={24}
                                            height={24}
                                            className="cursor-pointer text-white"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                event.preventDefault();
                                                dispatch?.close();
                                            }}
                                        />
                                    </div>
                                    <Image
                                        src={state ?? current}
                                        alt={state ?? current}
                                        width={1000}
                                        height={1000}
                                        className="max-h-[calc(100vh-110px)] max-w-full"
                                    />

                                    {post ? (
                                        <div className="my-1 flex w-[512px] items-center justify-between">
                                            {isMultiple && !isAtStart ? (
                                                <ArrowLeftIcon
                                                    className="cursor-pointer text-secondary"
                                                    width={16}
                                                    height={16}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        event.preventDefault();
                                                        if (!state && current) setState(current);
                                                        prev();
                                                    }}
                                                />
                                            ) : null}
                                            <PostActions post={post} disablePadding className="mx-auto" />
                                            {isMultiple && !isAtEnd ? (
                                                <ArrowRightIcon
                                                    className="cursor-pointer text-secondary"
                                                    width={16}
                                                    height={16}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        event.preventDefault();
                                                        if (!state && current) setState(current);
                                                        next();
                                                    }}
                                                />
                                            ) : null}
                                        </div>
                                    ) : null}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        );
    },
);
