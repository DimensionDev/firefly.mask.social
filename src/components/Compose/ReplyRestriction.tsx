import { Popover, Transition } from '@headlessui/react';
import { getEnumAsArray } from '@masknet/kit';
import { last } from 'lodash-es';
import { Fragment } from 'react';

import RadioDisableNoIcon from '@/assets/radio.disable-no.svg';
import YesIcon from '@/assets/yes.svg';
import { ReplyRestrictionText } from '@/components/Compose/ReplyRestrictionText.js';
import { RestrictionType } from '@/constants/enum.js';
import { classNames } from '@/helpers/classNames.js';
import { isValidRestrictionType } from '@/helpers/isValidRestrictionType.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';

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
            <Popover.Panel className="absolute bottom-full right-0 flex w-[320px] -translate-y-3 flex-col gap-2 rounded-lg bg-bgModal p-3 text-[15px] shadow-popover dark:border dark:border-line dark:shadow-none">
                {items.map(({ type, disabled }) => (
                    <Fragment key={type}>
                        <div
                            className={classNames(
                                'flex h-[22px] items-center justify-between',
                                disabled ? 'cursor-no-drop' : 'cursor-pointer',
                            )}
                            onClick={() => {
                                if (!disabled) setRestriction(type);
                            }}
                        >
                            <span
                                className={classNames('font-bold text-main', {
                                    'opacity-50': disabled,
                                })}
                            >
                                <ReplyRestrictionText type={type} />
                            </span>
                            {restriction === type ? (
                                <YesIcon width={40} height={40} className="relative -right-[10px]" />
                            ) : (
                                <RadioDisableNoIcon width={20} height={20} className="text-secondaryLine" />
                            )}
                        </div>
                        {type !== last(items)?.type && <div className="h-px bg-line" />}
                    </Fragment>
                ))}
            </Popover.Panel>
        </Transition>
    );
}
