import { Transition, Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment, useCallback } from 'react';

interface ComposeProps {
    opened: boolean;
    setOpened: (opened: boolean) => void;
    setComposeOpened: (opened: boolean) => void;
}
export default function Discard({ opened, setOpened, setComposeOpened }: ComposeProps) {
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
                            <Dialog.Panel className=" w-[356px] p-6 gap-6 flex flex-col overflow-hidden rounded-xl bg-white transition-all">
                                {/* Title */}
                                <Dialog.Title as="h3" className=" h-6 relative">
                                    <XMarkIcon
                                        className="h-6 w-6 absolute cursor-pointer left-0 top-0"
                                        aria-hidden="true"
                                        onClick={close}
                                    />

                                    <span className=" text-[#07101B] text-lg leading-6 font-bold h-full w-full capitalize flex items-center justify-center">
                                        Discard
                                    </span>
                                </Dialog.Title>

                                <div className=" text-sm">This can’t be undone and you’ll lose your draft</div>

                                <button
                                    className=" w-full h-10 rounded-full bg-[#FF3545] flex items-center justify-center text-white text-sm font-bold"
                                    onClick={() => {
                                        close();
                                        setComposeOpened(false);
                                    }}
                                >
                                    Confirm
                                </button>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
