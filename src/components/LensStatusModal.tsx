'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Image } from '@/esm/Image.js';

const loggedLens = [{ name: 'Lens', handle: '@ssssss', avatar: '/svg/lens.svg' }];

interface LoginModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function LoginModal({ isOpen, setIsOpen }: LoginModalProps) {
    function closeModal() {
        setIsOpen(false);
    }
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[999]" onClose={closeModal}>
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
                            <Dialog.Panel className="transform rounded-[12px] bg-white transition-all">
                                <div className="w-[260px] flex-col items-center gap-[23px] rounded-[16px] border-[0.5px] border-lightLineSecond p-[24px]">
                                    {loggedLens.map(({ avatar, handle, name }) => (
                                        <div key={handle} className="flex items-center gap-[8px]">
                                            <div className="flex h-[40px] w-[48px] items-start justify-start">
                                                <div className="relative h-[40px] w-[40px]">
                                                    <div className="absolute left-0 top-0 h-[36px] w-[36px] rounded-[99px] shadow backdrop-blur-lg">
                                                        <Image src={avatar} alt="avatar" width={36} height={36} />
                                                    </div>
                                                    <Image
                                                        className="absolute left-[24px] top-[24px] h-[16px] w-[16px] rounded-[99px] border border-white shadow"
                                                        src={'/svg/lens.svg'}
                                                        alt="logo"
                                                        width={16}
                                                        height={16}
                                                    />
                                                </div>
                                            </div>
                                            <div className="inline-flex shrink grow basis-0 flex-col items-start justify-center gap-1">
                                                <div className="font-['PingFang SC'] text-base font-medium text-neutral-900">
                                                    {name}
                                                </div>
                                                <div className="font-['PingFang SC'] text-[15px] font-normal text-neutral-500">
                                                    @{handle}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
