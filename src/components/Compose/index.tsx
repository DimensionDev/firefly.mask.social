import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useCallback, useState } from 'react';

import LoadingIcon from '@/assets/loading.svg';
import ComposeAction from '@/components/Compose/ComposeAction.js';
import ComposeContent from '@/components/Compose/ComposeContent.js';
import ComposeSend from '@/components/Compose/ComposeSend.js';
import Discard from '@/components/Compose/Discard.js';
import withLexicalContext from '@/components/shared/lexical/withLexicalContext.js';
import type { Post } from '@/providers/types/SocialMedia.js';
import type { IPFSResponse } from '@/services/uploadToIPFS.js';

export interface IImage {
    file: File;
    ipfs: IPFSResponse;
}

interface IComposeProps {
    type?: 'compose' | 'quote' | 'reply';
    post?: Post;
    opened: boolean;
    setOpened: (opened: boolean) => void;
}
function Compose({ type = 'compose', post, opened, setOpened }: IComposeProps) {
    const [characters, setCharacters] = useState('');
    const [discardOpened, setDiscardOpened] = useState(false);
    const [images, setImages] = useState<IImage[]>([]);
    const [loading, setLoading] = useState(false);

    const close = useCallback(() => {
        if (characters) {
            setDiscardOpened(true);
        } else {
            setOpened(false);
        }
    }, [characters, setOpened]);

    return (
        <>
            <Discard opened={discardOpened} setOpened={setDiscardOpened} setComposeOpened={setOpened} />

            <Transition appear show={opened} as={Fragment}>
                <Dialog as="div" className="relative z-[1000]" onClose={close}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="bg-bgModalLayer fixed inset-0 bg-opacity-30" />
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
                                <Dialog.Panel className="relative w-[600px] overflow-hidden rounded-xl bg-bgModal shadow-popover transition-all">
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

                                    {/* Content */}
                                    <ComposeContent
                                        type={type}
                                        setCharacters={setCharacters}
                                        images={images.map((image) => image.file)}
                                        setImages={setImages}
                                        post={post}
                                    />

                                    {/* Action */}
                                    <ComposeAction
                                        type={type}
                                        images={images}
                                        setImages={setImages}
                                        setLoading={setLoading}
                                    />

                                    {/* Send */}
                                    <ComposeSend
                                        type={type}
                                        characters={characters}
                                        images={images}
                                        setOpened={setOpened}
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
}

export default withLexicalContext(Compose);
