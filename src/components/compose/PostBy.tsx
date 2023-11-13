import { classNames } from '@/helpers/classNames';
import { Popover, Transition } from '@headlessui/react';
import Image from 'next/image';
import { Fragment, useMemo } from 'react';

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
            <Popover.Panel className="absolute -translate-y-3 bottom-full right-0 w-[280px] rounded-lg p-3 flex flex-col gap-2 bg-white shadow-popover">
                <div className=" h-[22px] flex justify-between items-center cursor-pointer">
                    <div className=" flex items-center gap-2">
                        <Image src="/svg/gallery.svg" width={22} height={22} alt="gallery" />
                        <span
                            className={classNames(' text-[#07101B] text-sm font-bold', !disabled ? ' opacity-50' : '')}
                        >
                            @LensA
                        </span>
                    </div>
                    <Image src="/svg/radio.yes.svg" width={16} height={16} alt="radio.yes" />
                </div>

                <div className=" bg-[#F2F5F6] h-px" />

                <div
                    className={classNames(
                        ' h-[22px] flex justify-between items-center',
                        disabled ? ' cursor-no-drop' : ' cursor-pointer',
                    )}
                >
                    <div className=" flex items-center gap-2">
                        <Image src="/svg/gallery.svg" width={22} height={22} alt="gallery" />
                        <span
                            className={classNames(' text-[#07101B] text-sm font-bold', disabled ? ' opacity-50' : '')}
                        >
                            @LensB
                        </span>
                    </div>
                    <button className=" text-xs font-bold text-[#246BFD]">Switch</button>
                </div>

                <div className=" bg-[#F2F5F6] h-px" />

                <div className=" h-[22px] flex justify-between items-center cursor-pointer">
                    <div className=" flex items-center gap-2">
                        <Image src="/svg/gallery.svg" width={22} height={22} alt="gallery" />
                        <span
                            className={classNames(' text-[#07101B] text-sm font-bold', !disabled ? ' opacity-50' : '')}
                        >
                            @FarcasterA
                        </span>
                    </div>
                    <button className=" text-xs font-bold text-[#246BFD]">Log in</button>
                </div>
            </Popover.Panel>
        </Transition>
    );
}
