import { Dialog, Transition } from '@headlessui/react';
import { t, Trans } from '@lingui/macro';
import type { SingletonModalRefCreator } from '@masknet/shared-base';
import { useSingletonModal } from '@masknet/shared-base-ui';
import React, { forwardRef, Fragment, useState } from 'react';

import CloseIcon from '@/assets/close.svg';

export interface ConfirmModalOpenProps {
    title?: string;
    content: React.ReactNode;
}

export type ConfirmModalCloseProps = boolean;

export const ConfirmModal = forwardRef<SingletonModalRefCreator<ConfirmModalOpenProps, ConfirmModalCloseProps>>(
    function ConfirmModal(_, ref) {
        const [title, setTitle] = useState<string>();
        const [content, setContent] = useState<React.ReactNode>();

        const [open, dispatch] = useSingletonModal(ref, {
            onOpen(props) {
                setTitle(props.title);
                setContent(props.content);
            },
        });

        return (
            <Transition appear show={open} as={Fragment}>
                <Dialog as="div" className="relative z-[999]" onClose={() => dispatch?.close(false)}>
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
                                <Dialog.Panel className="relative w-[355px] rounded-xl bg-bgModal shadow-popover transition-all dark:text-gray-950">
                                    <div className="inline-flex h-[56px] w-[355px] items-center justify-center gap-2 rounded-t-[12px] p-4">
                                        <button onClick={() => dispatch?.close(false)}>
                                            <CloseIcon className="relative h-[24px] w-[24px]" width={24} height={24} />
                                        </button>
                                        <div className="shrink grow basis-0 text-center text-lg font-bold leading-snug text-main">
                                            {title ? title : <Trans>Confirmation</Trans>}
                                        </div>
                                        <div className="relative h-[24px] w-[24px]" />
                                    </div>

                                    <div className="flex flex-col gap-[12px] p-[24px]">
                                        {content}
                                        <button
                                            className=" flex items-center justify-center rounded-full bg-commonDanger py-[11px] font-bold text-lightBottom"
                                            onClick={async () => {
                                                dispatch?.close(true);
                                            }}
                                        >
                                            {t`Confirm`}
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        );
    },
);
