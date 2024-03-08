'use client';

import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

interface ModalProps {
    fullScreen?: boolean;
    backdrop?: boolean;
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

export function Modal({ fullScreen, backdrop = true, open, onClose, children }: ModalProps) {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
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
                        <div className="fixed inset-0 bg-main/25 bg-opacity-30" />
                    </Transition.Child>
                ) : null}
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
                            {children}
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
