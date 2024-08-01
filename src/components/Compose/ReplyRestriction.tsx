import { Popover, Transition } from '@headlessui/react';
import { getEnumAsArray } from '@masknet/kit';
import { Fragment } from 'react';

import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import RadioYesIcon from '@/assets/radio.yes.svg';
import { ReplyRestrictionText } from '@/components/Compose/ReplyRestrictionText.js';
import { RestrictionType } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { isValidRestrictionType } from '@/helpers/isValidRestrictionType.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { useIsMedium } from '@/hooks/useMediaQuery.js';

interface ReplyRestrictionProps {
    restriction: RestrictionType;
    setRestriction: (restriction: RestrictionType) => void;
}

export function ReplyRestriction({ restriction, setRestriction }: ReplyRestrictionProps) {
    const { availableSources } = useCompositePost();

    const items = getEnumAsArray(RestrictionType).map(({ value: type }) => {
        return {
            type,
            disabled: !isValidRestrictionType(type, availableSources),
        };
    });

    const isMedium = useIsMedium();

    const content = (
        <div className="flex flex-col bg-lightBottom py-1 dark:bg-darkBottom">
            {items.map(({ type, disabled }) => (
                <div
                    key={type}
                    className={classNames(
                        'flex h-10 items-center justify-between py-3',
                        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                    )}
                    onClick={() => {
                        if (!disabled) setRestriction(type);
                    }}
                >
                    <span className={classNames('mr-auto font-bold text-main', { 'opacity-50': disabled })}>
                        <ReplyRestrictionText type={type} />
                    </span>
                    {restriction === type ? (
                        <RadioYesIcon width={20} height={20} />
                    ) : (
                        <RadioDisableNoIcon width={20} height={20} className="text-secondaryLine" />
                    )}
                </div>
            ))}
        </div>
    );

    if (isMedium)
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
                <Popover.Panel className="absolute bottom-full right-0 z-10 w-[320px] -translate-y-3 rounded-lg bg-lightBottom p-3 text-medium shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none">
                    {content}
                </Popover.Panel>
            </Transition>
        );

    return content;
}
