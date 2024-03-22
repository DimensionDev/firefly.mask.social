'use client';

import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

interface ModalProps {
    backdrop?: boolean;
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

export function Modal({ backdrop = true, open, onClose, children }: ModalProps) {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Dialog.Panel className="fixed inset-0 overflow-y-auto">
                    <div className=" flex min-h-full items-center justify-center p-0 text-center md:p-4">
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
