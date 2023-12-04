import { Popover, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { Fragment, useMemo } from 'react';

import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import RadioYesIcon from '@/assets/radio.yes.svg';
import { classNames } from '@/helpers/classNames.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';

interface IReplyRestrictionProps {
    restriction: number;
    setRestriction: (restriction: number) => void;
}
export default function ReplyRestriction({ restriction, setRestriction }: IReplyRestrictionProps) {
    const currentFarcasterAccount = useFarcasterStateStore.use.currentAccount();

    const disabled = useMemo(() => currentFarcasterAccount.id, [currentFarcasterAccount.id]);

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
                <div
                    className=" flex h-[22px] cursor-pointer items-center justify-between"
                    onClick={() => setRestriction(0)}
                >
                    <span className={classNames(' text-sm font-bold text-main')}>
                        <Trans>Everyone can reply</Trans>
                    </span>
                    {restriction === 0 ? (
                        <RadioYesIcon width={16} height={16} />
                    ) : (
                        <RadioDisableNoIcon width={16} height={16} />
                    )}
                </div>

                <div className=" h-px bg-[#F2F5F6]" />

                <div
                    className={classNames(
                        ' flex h-[22px] items-center justify-between',
                        disabled ? ' cursor-no-drop' : ' cursor-pointer',
                    )}
                    onClick={() => !disabled && setRestriction(1)}
                >
                    <span className={classNames(' text-sm font-bold text-main', disabled ? ' opacity-50' : '')}>
                        <Trans>Only people you follow can reply</Trans>
                    </span>
                    {restriction === 1 ? (
                        <RadioYesIcon width={16} height={16} />
                    ) : (
                        <RadioDisableNoIcon width={16} height={16} />
                    )}
                </div>
            </Popover.Panel>
        </Transition>
    );
}
