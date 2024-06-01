'use client';

import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useRef } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface ModalProps {
    backdrop?: boolean;
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
    className?: string;
    disableScrollLock?: boolean;
}

export function Modal({ backdrop = true, open, onClose, children, className, disableScrollLock = true }: ModalProps) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                initialFocus={ref}
                as="div"
                className="relative z-[100]"
                onClose={onClose}
                disableScrollLock={disableScrollLock}
            >
                <Dialog.Panel className="fixed inset-0 overflow-y-auto">
                    <div
                        className={classNames(
                            'flex min-h-full items-center justify-center p-0 text-center md:p-4',
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
