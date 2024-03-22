import { Popover, Transition } from '@headlessui/react';
import { Trans } from '@lingui/macro';
import { Fragment } from 'react';

import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import YesIcon from '@/assets/yes.svg';
import { classNames } from '@/helpers/classNames.js';
import { useFarcasterStateStore } from '@/store/useProfileStore.js';

interface ReplyRestrictionProps {
    restriction: number;
    setRestriction: (restriction: number) => void;
}
export function ReplyRestriction({ restriction, setRestriction }: ReplyRestrictionProps) {
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile();

    const disabled = !!currentFarcasterProfile?.profileId;

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
            <Popover.Panel className="absolute bottom-full right-0 flex w-[320px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] shadow-popover">
                <div
                    className=" flex h-[22px] cursor-pointer items-center justify-between"
                    onClick={() => setRestriction(0)}
                >
                    <span className={classNames(' font-bold text-main')}>
                        <Trans>Everyone</Trans>
                    </span>
                    {restriction === 0 ? (
                        <YesIcon width={40} height={40} className=" relative -right-[10px]" />
                    ) : (
                        <RadioDisableNoIcon width={20} height={20} className=" text-secondaryLine" />
                    )}
                </div>

                <div className=" h-px bg-line" />

                <div
                    className={classNames(
                        ' flex h-[22px] items-center justify-between',
                        disabled ? ' cursor-no-drop' : ' cursor-pointer',
                    )}
                    onClick={() => !disabled && setRestriction(1)}
                >
                    <span className={classNames(' font-bold text-main', disabled ? ' opacity-50' : '')}>
                        <Trans>Only people you follow</Trans>
                    </span>
                    {restriction === 1 ? (
                        <YesIcon width={40} height={40} className=" relative -right-[10px]" />
                    ) : (
                        <RadioDisableNoIcon width={20} height={20} className=" text-secondaryLine" />
                    )}
                </div>
            </Popover.Panel>
        </Transition>
    );
}
