import { Dialog, Transition } from '@headlessui/react';
import { noop } from 'lodash-es';
import React, { Fragment, useRef } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface ModalProps {
    backdrop?: boolean;
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    className?: string;
    disableScrollLock?: boolean;
    /**
     * Close the `onClose` of the dialog.
     * The `onClose` of Dialog will respond to all click events outside the `Dialog.Panel`.
     * Problems may occur when ConfirmModal is in use. Note, this will also close all shortcut keys for close.
     */
    disableDialogClose?: boolean;
    disableBackdropClose?: boolean;
}

export function Modal({
    backdrop = true,
    open,
    onClose,
    children,
    className,
    disableScrollLock = true,
    disableDialogClose = false,
    disableBackdropClose = false,
}: ModalProps) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                initialFocus={ref}
                as="div"
                className="relative z-40"
                onClose={disableDialogClose ? noop : onClose}
                disableScrollLock={disableScrollLock}
            >
                <Dialog.Panel className="fixed inset-0 overflow-y-auto">
                    <div
                        className={classNames(
                            'flex min-h-full items-center justify-center overflow-auto p-0 text-center md:p-4',
                            className,
                        )}
                        ref={ref}
                    >
                        {backdrop ? (
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div
                                    className="fixed inset-0 bg-main/25 bg-opacity-30"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        ev.stopPropagation();
                                        if (disableBackdropClose) return;
                                        onClose?.();
                                    }}
                                />
                            </Transition.Child>
                        ) : null}
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            {children}
                        </Transition.Child>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </Transition>
    );
}
