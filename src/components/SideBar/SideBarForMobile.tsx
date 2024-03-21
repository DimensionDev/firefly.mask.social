'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, memo, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import CloseIcon from '@/assets/close.svg';
import DarkLogo from '@/assets/logo.dark.svg';
import LightLogo from '@/assets/logo.light.svg';
import { Menu } from '@/components/SideBar/Menu.js';
import { PageRoute } from '@/constants/enum.js';
import { Link } from '@/esm/Link.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

export const SideBarForMobile = memo(function SideBarForMobile() {
    const { isDarkMode } = useDarkMode();

    const { sidebarOpen, updateSidebarOpen } = useNavigatorState();

    const rootRef = useRef(null);

    useOnClickOutside(rootRef, () => {
        updateSidebarOpen(false);
    });

    return (
        <Transition.Root show={sidebarOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50 lg:hidden" onClose={() => updateSidebarOpen(false)}>
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity ease-linear duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease-linear duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-main/25 bg-opacity-30" />
                </Transition.Child>

                <div className="fixed inset-0 flex">
                    <Transition.Child
                        as={Fragment}
                        enter="transition ease-in-out duration-300 transform"
                        enterFrom="-translate-x-full"
                        enterTo="translate-x-0"
                        leave="transition ease-in-out duration-300 transform"
                        leaveFrom="translate-x-0"
                        leaveTo="-translate-x-full"
                    >
                        <Dialog.Panel className="relative mr-16 flex w-full max-w-[280px] flex-1">
                            <div className=" fixed inset-0 z-50 flex w-[280px] flex-col bg-white dark:bg-black ">
                                <div className="flex grow flex-col gap-y-5 border-r border-line px-3 lg:px-6">
                                    <div className="flex h-16 shrink-0 items-center lg:px-4">
                                        <Link href={PageRoute.Home}>
                                            {!isDarkMode ? (
                                                <LightLogo width={134} height={64} />
                                            ) : (
                                                <DarkLogo width={134} height={64} />
                                            )}
                                        </Link>
                                    </div>
                                    <Menu />
                                </div>
                            </div>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-in-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in-out duration-300"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="absolute right-0 top-0 z-50 flex w-16 justify-center pt-4">
                                    <button
                                        type="button"
                                        className="-m-2.5 p-2.5"
                                        onClick={() => updateSidebarOpen(false)}
                                    >
                                        <span className="sr-only">Close sidebar</span>
                                        <CloseIcon className="h-6 w-6 text-main" aria-hidden="true" />
                                    </button>
                                </div>
                            </Transition.Child>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
});
