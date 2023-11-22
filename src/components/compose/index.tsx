import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useCallback, useState } from 'react';

import ComposeAction from '@/components/compose/ComposeAction.js';
import ComposeContent from '@/components/compose/ComposeContent.js';
import ComposeSend from '@/components/compose/ComposeSend.js';
import Discard from '@/components/compose/Discard.js';
import withLexicalContext from '@/components/shared/lexical/withLexicalContext.js';

interface ComposeProps {
    type?: 'compose' | 'quote' | 'reply';
    opened: boolean;
    setOpened: (opened: boolean) => void;
}
function Compose({ type = 'compose', opened, setOpened }: ComposeProps) {
    const [characters, setCharacters] = useState('');
    const [discardOpened, setDiscardOpened] = useState(false);
    const [images, setImages] = useState<File[]>([]);

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
                <Dialog as="div" className="relative z-[100]" onClose={close}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
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
                                <Dialog.Panel className="w-[600px] overflow-hidden rounded-xl bg-white transition-all">
                                    {/* Title */}
                                    <Dialog.Title as="h3" className=" relative h-14">
                                        <XMarkIcon
                                            className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 cursor-pointer"
                                            aria-hidden="true"
                                            onClick={close}
                                        />

                                        <span className=" flex h-full w-full items-center justify-center text-lg font-bold capitalize text-[#07101B]">
                                            {type}
                                        </span>
                                    </Dialog.Title>

                                    {/* Content */}
                                    <ComposeContent
                                        type={type}
                                        setCharacters={setCharacters}
                                        images={images}
                                        setImages={setImages}
                                    />

                                    {/* Action */}
                                    <ComposeAction type={type} setImages={setImages} />

                                    {/* Send */}
                                    <ComposeSend charactersLen={characters.length} setOpened={setOpened} />
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
