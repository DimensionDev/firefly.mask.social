import { Dialog, Transition } from '@headlessui/react';
import type React from 'react';
import { Fragment } from 'react';

interface DraggablePopoverProps {
    open: boolean;
    backdrop?: boolean;
    onClose?: () => void;
    children?: React.ReactNode;
}

export function DraggablePopover({ open, backdrop = true, onClose, children }: DraggablePopoverProps) {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" onClose={() => onClose?.()}>
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
                        <div className="fixed inset-0 z-40 bg-main/25 bg-opacity-30" />
                    </Transition.Child>
                ) : null}
                <Dialog.Panel className=" fixed inset-x-6 bottom-3 top-auto z-40 flex flex-col justify-center rounded-2xl border border-line bg-primaryBottom p-6 shadow-[0px_4px_30px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_8px_20px_0px_rgba(255,255,255,0.04)]">
                    <div className=" absolute inset-x-0 top-0.5 z-10 m-auto flex w-20 cursor-pointer justify-center p-2">
                        <div className=" h-1 w-12 rounded-full bg-main" />
                    </div>
                    <div className=" max-h-[50vh] w-full overflow-y-auto">{children}</div>
                </Dialog.Panel>
            </Dialog>
        </Transition>
    );
}
