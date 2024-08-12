'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, memo, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import DarkLogo from '@/assets/logo.dark.svg';
import LightLogo from '@/assets/logo.light.svg';
import { CloseButton } from '@/components/CloseButton.js';
import { Menu } from '@/components/SideBar/Menu.js';
import { useDarkMode } from '@/hooks/useDarkMode.js';
import { useDisableScrollPassive } from '@/hooks/useDisableScrollPassive.js';
import { useNavigatorState } from '@/store/useNavigatorStore.js';

export const SideBarForMobile = memo(function SideBarForMobile() {
    const { setRef } = useDisableScrollPassive();
    const { isDarkMode } = useDarkMode();

    const { sidebarOpen, updateSidebarOpen } = useNavigatorState();

    const rootRef = useRef(null);

    useOnClickOutside(rootRef, () => {
        updateSidebarOpen(false);
    });

    return (
        <Transition.Root show={sidebarOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => updateSidebarOpen(false)} disableScrollLock>
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

                <div className="fixed inset-0 flex" ref={(ref) => setRef(ref)}>
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
                            <div className="fixed inset-0 z-50 flex w-[280px] flex-col bg-white group-[.not-support]:!top-0 dark:bg-black">
                                <div className="flex grow flex-col gap-y-4 border-r border-line px-3">
                                    <div className="-ml-2 flex h-16 shrink-0 items-center">
                                        {isDarkMode ? (
                                            <DarkLogo width={169} height={80} />
                                        ) : (
                                            <LightLogo width={169} height={80} />
                                        )}
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
                                    <CloseButton className="-m-2.5 p-2.5" onClick={() => updateSidebarOpen(false)} />
                                </div>
                            </Transition.Child>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition.Root>
    );
});
