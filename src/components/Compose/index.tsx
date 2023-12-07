'use client';

import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { forwardRef, Fragment, useCallback, useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import ComposeSend from '@/components/Compose/ComposeSend.js';
import Discard from '@/components/Compose/Discard.js';
import WithLexicalContextWrapper from '@/components/Compose/WithLexicalContextWrapper.js';
import { EMPTY_LIST } from '@/constants/index.js';
import type { SingletonModalRefCreator } from '@/maskbook/packages/shared-base/src/index.js';
import { useSingletonModal } from '@/maskbook/packages/shared-base-ui/src/index.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { IPFS_MediaObject } from '@/types/index.js';

export interface ComposeProps {
    type?: 'compose' | 'quote' | 'reply';
    post?: Post;
}
// { type = 'compose', post, opened, setOpened }: ComposeProps
const ComposeModal = forwardRef<SingletonModalRefCreator<ComposeProps>>(function Compose(_, ref) {
    const [type, setType] = useState<'compose' | 'quote' | 'reply'>('compose');
    const [post, setPost] = useState<Post>();
    const [characters, setCharacters] = useState('');
    const [discardOpened, setDiscardOpened] = useState(false);
    const [images, setImages] = useState<IPFS_MediaObject[]>(EMPTY_LIST);
    const [loading, setLoading] = useState(false);

    const [open, dispatch] = useSingletonModal(ref, {
        onOpen: (props) => {
            setType(props.type || 'compose');
            setPost(props.post);
        },
        onClose: () => {
            setCharacters('');
            setImages(EMPTY_LIST);
            setPost(undefined);
        },
    });

    const close = useCallback(() => {
        dispatch?.close();
    }, [dispatch]);

    return (
        <>
            <Discard opened={discardOpened} setOpened={setDiscardOpened} closeCompose={close} />

            <Transition appear show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-[1000]"
                    onClose={() => {
                        if (characters) {
                            setDiscardOpened(true);
                        } else {
                            close();
                        }
                    }}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 bg-opacity-30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className=" flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="relative w-[600px] overflow-hidden rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950">
                                    {/* Loading */}
                                    {loading ? (
                                        <div className=" absolute bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center">
                                            <LoadingIcon className="animate-spin" width={24} height={24} />
                                        </div>
                                    ) : null}

                                    {/* Title */}
                                    <Dialog.Title as="h3" className=" relative h-14">
                                        <XMarkIcon
                                            className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 cursor-pointer"
                                            aria-hidden="true"
                                            onClick={close}
                                        />

                                        <span className=" flex h-full w-full items-center justify-center text-lg font-bold capitalize text-main">
                                            {type}
                                        </span>
                                    </Dialog.Title>

                                    <WithLexicalContextWrapper
                                        type={type}
                                        setCharacters={setCharacters}
                                        images={images}
                                        setImages={setImages}
                                        setLoading={setLoading}
                                        post={post}
                                    />

                                    {/* Send */}
                                    <ComposeSend
                                        type={type}
                                        characters={characters}
                                        images={images}
                                        closeCompose={close}
                                        setLoading={setLoading}
                                        post={post}
                                    />
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
});

export default ComposeModal;
