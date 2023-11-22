import { Image } from '@/esm/Image.js';
import { classNames } from '@/helpers/classNames.js';
import { Popover, Transition } from '@headlessui/react';
import { useMemo, Fragment } from 'react';

export default function ReplyRestriction() {
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
                    <span className={classNames(' text-sm font-bold text-[#07101B]', !disabled ? ' opacity-50' : '')}>
                        Everyone can reply
                    </span>
                    <Image src="/svg/radio.yes.svg" width={16} height={16} alt="radio.yes" />
                </div>

                <div className=" h-px bg-[#F2F5F6]" />

                <div
                    className={classNames(
                        ' flex h-[22px] items-center justify-between',
                        disabled ? ' cursor-no-drop' : ' cursor-pointer',
                    )}
                >
                    <span className={classNames(' text-sm font-bold text-[#07101B]', disabled ? ' opacity-50' : '')}>
                        Only people you follow can reply
                    </span>
                    <Image src="/svg/radio.disable-no.svg" width={16} height={16} alt="radio.disable-no" />
                </div>
            </Popover.Panel>
        </Transition>
    );
}
