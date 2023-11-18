'use client';

import { Image } from '@/esm/Image.js';
import { useCallback, Fragment, useState } from 'react';
import { LensSocialMedia } from '@/providers/lens/SocialMedia.js';
import { Dialog, Transition } from '@headlessui/react';
import { LoginFarcaster } from '@/components/LoginFarcaster.js';

const loginActions = [
    { name: 'Lens', logo: '/svg/lens.svg' },
    { name: 'Farcaster', logo: '/svg/farcaster.svg' },
];

interface LoginModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function LoginModal({ isOpen, setIsOpen }: LoginModalProps) {
    const [farcasterOpen, setFarcasterOpen] = useState(false);
    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    const loginLens = useCallback(() => {
        const lensProvider = new LensSocialMedia();
        lensProvider.createSession();
    }, []);
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
                                {!farcasterOpen ? (
                                    <div
                                        className="flex w-[600px] flex-col rounded-[12px]"
                                        style={{ boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.10)' }}
                                    >
                                        <div className="inline-flex h-[56px] w-[600px] items-center justify-center gap-2 rounded-t-[12px] bg-gradient-to-b from-white to-white p-4">
                                            <button
                                                onClick={() => {
                                                    setIsOpen(false);
                                                }}
                                            >
                                                <Image
                                                    className="relative h-[24px] w-[24px]"
                                                    src="/svg/close.svg"
                                                    alt="close"
                                                    width={24}
                                                    height={24}
                                                />
                                            </button>
                                            <div className="shrink grow basis-0 text-center font-['Helvetica'] text-lg font-bold leading-snug text-slate-950">
                                                Login
                                            </div>
                                            <div className="relative h-[24px] w-[24px]" />
                                        </div>
                                        <div className="flex w-full flex-col gap-[16px] p-[16px] ">
                                            {loginActions.map(({ name, logo }) => (
                                                <button
                                                    className="group flex flex-col rounded-lg p-[16px] hover:bg-lightBg"
                                                    key={name}
                                                    onClick={() => {
                                                        name === 'Lens' ? loginLens() : setFarcasterOpen(true);
                                                    }}
                                                >
                                                    <div className="inline-flex w-full flex-col items-center justify-start gap-[8px] rounded-lg px-[16px] py-[24px]">
                                                        <div className="relative h-[48px] w-[48px]">
                                                            <Image
                                                                className="left-0 top-0 rounded-full"
                                                                src={logo}
                                                                width={48}
                                                                height={48}
                                                                alt="lens"
                                                            />
                                                        </div>
                                                        <div className="font-['Helvetica'] text-sm font-bold leading-[18px] text-lightSecond group-hover:text-textMain">
                                                            {name}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <LoginFarcaster
                                        closeFarcaster={() => {
                                            setFarcasterOpen(false);
                                        }}
                                    />
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
