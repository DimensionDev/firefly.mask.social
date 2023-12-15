import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Trans } from '@lingui/macro';
import { Fragment, useCallback } from 'react';

import { ComposeModalRef } from '@/modals/controls.js';

interface DiscardProps {
    opened: boolean;
    setOpened: (opened: boolean) => void;
}
export default function Discard({ opened, setOpened }: DiscardProps) {
    const close = useCallback(() => setOpened(false), [setOpened]);

    return (
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
                    <div className="fixed inset-0 bg-main/25 bg-opacity-30" />
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
                            <Dialog.Panel className=" flex w-[370px] flex-col gap-6 overflow-hidden rounded-xl bg-bgModal p-6 text-[15px] transition-all">
                                {/* Title */}
                                <Dialog.Title as="h3" className=" relative h-6">
                                    <XMarkIcon
                                        className="absolute left-0 top-0 h-6 w-6 cursor-pointer"
                                        aria-hidden="true"
                                        onClick={close}
                                    />

                                    <span className=" flex h-full w-full items-center justify-center text-lg font-bold capitalize leading-6 text-main">
                                        <Trans>Discard</Trans>
                                    </span>
                                </Dialog.Title>

                                <div>
                                    <Trans>This can’t be undone and you’ll lose your draft.</Trans>
                                </div>

                                <button
                                    className=" bottom-danger flex h-10 w-full items-center justify-center rounded-full bg-danger font-bold text-primaryBottom"
                                    onClick={() => {
                                        close();
                                        ComposeModalRef.close();
                                    }}
                                >
                                    <Trans>Confirm</Trans>
                                </button>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
