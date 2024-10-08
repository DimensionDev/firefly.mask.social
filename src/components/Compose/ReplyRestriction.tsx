import { Popover, Transition } from '@headlessui/react';
import { getEnumAsArray } from '@masknet/kit';
import { Fragment } from 'react';

import { CircleCheckboxIcon } from '@/components/CircleCheckboxIcon.js';
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
        <div className="flex flex-col rounded-lg md:bg-lightBottom md:dark:bg-darkBottom">
            {items.map(({ type, disabled }) => (
                <div
                    key={type}
                    className={classNames(
                        'flex h-12 items-center justify-between px-3',
                        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-bg',
                    )}
                    onClick={() => {
                        if (!disabled) setRestriction(type);
                    }}
                >
                    <span className={classNames('mr-auto font-bold text-main', { 'opacity-50': disabled })}>
                        <ReplyRestrictionText type={type} />
                    </span>
                    <CircleCheckboxIcon checked={restriction === type} />
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
                <Popover.Panel className="absolute bottom-full right-0 z-10 w-[320px] -translate-y-3 overflow-hidden rounded-lg bg-lightBottom text-medium shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none">
                    {content}
                </Popover.Panel>
            </Transition>
        );

    return content;
}
