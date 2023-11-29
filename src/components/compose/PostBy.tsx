import { Popover, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { Fragment, useMemo } from 'react';

import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';

export default function PostBy() {
    const disabled = useMemo(() => true, []);

    return (
        <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-y-1"
        >
            <Popover.Panel className="absolute bottom-full right-0 flex w-[280px] -translate-y-3 flex-col gap-2 rounded-lg bg-white p-3 shadow-popover">
                <div className=" flex h-[22px] cursor-pointer items-center justify-between">
                    <div className=" flex items-center gap-2">
                        <Image src="/svg/gallery.svg" width={22} height={22} alt="gallery" />
                        <span
                            className={classNames(' text-sm font-bold text-[#07101B]', !disabled ? ' opacity-50' : '')}
                        >
                            @LensA
                        </span>
                    </div>
                    <Image src="/svg/radio.yes.svg" width={16} height={16} alt="radio.yes" />
                </div>

                <div className=" h-px bg-[#F2F5F6]" />

                <div
                    className={classNames(
                        ' flex h-[22px] items-center justify-between',
                        disabled ? ' cursor-no-drop' : ' cursor-pointer',
                    )}
                >
                    <div className=" flex items-center gap-2">
                        <Image src="/svg/gallery.svg" width={22} height={22} alt="gallery" />
                        <span
                            className={classNames(' text-sm font-bold text-[#07101B]', disabled ? ' opacity-50' : '')}
                        >
                            @LensB
                        </span>
                    </div>
                    <button className=" text-xs font-bold text-[#246BFD]">
                        <Trans>Switch</Trans>
                    </button>
                </div>

                <div className=" h-px bg-[#F2F5F6]" />

                <div className=" flex h-[22px] cursor-pointer items-center justify-between">
                    <div className=" flex items-center gap-2">
                        <Image src="/svg/gallery.svg" width={22} height={22} alt="gallery" />
                        <span
                            className={classNames(' text-sm font-bold text-[#07101B]', !disabled ? ' opacity-50' : '')}
                        >
                            @FarcasterA
                        </span>
                    </div>
                    <button className=" text-xs font-bold text-[#246BFD]">
                        <Trans>Log in</Trans>
                    </button>
                </div>
            </Popover.Panel>
        </Transition>
    );
}
