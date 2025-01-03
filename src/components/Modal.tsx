import { Dialog, Transition, type DialogProps } from '@headlessui/react';
import { noop } from 'lodash-es';
import React, { Fragment, useRef, type HTMLProps } from 'react';

import { classNames } from '@/helpers/classNames.js';

export interface ModalProps {
    backdrop?: boolean;
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    disableScrollLock?: boolean;
    /**
     * Close the `onClose` of the dialog.
     * The `onClose` of Dialog will respond to all click events outside the `Dialog.Panel`.
     * Problems may occur when ConfirmModal is in use. Note, this will also close all shortcut keys for close.
     */
    disableDialogClose?: boolean;
    disableBackdropClose?: boolean;
    BackdropProps?: HTMLProps<HTMLDivElement>;
}

export function Modal({
    backdrop = true,
    open,
    onClose,
    children,
    disableScrollLock = true,
    disableDialogClose = false,
    disableBackdropClose = false,
    BackdropProps,
}: ModalProps) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                initialFocus={ref}
                className="relative z-40"
                onClose={disableDialogClose ? noop : onClose}
                disableScrollLock={disableScrollLock}
            >
                <Dialog.Panel className="fixed inset-0 overflow-y-auto">
                    <div
                        className={classNames(
                            'flex min-h-full items-center justify-center overflow-auto p-0 text-center md:p-4',
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
                                    {...BackdropProps}
                                    className={classNames(
                                        'fixed inset-0 bg-main/25 bg-opacity-30',
                                        BackdropProps?.className,
                                    )}
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
