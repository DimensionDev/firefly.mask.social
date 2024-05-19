import { Popover, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { t, Trans } from '@lingui/macro';
import { Fragment, useState } from 'react';

import { POLL_VALID_IN_DAYS_DEFAULT_LIST } from '@/constants/poll.js';
import { NUMBER_BIGGER_THAN_ZERO } from '@/constants/regexp.js';
import { classNames } from '@/helpers/classNames.js';
import { shouldShowCustomDaysInput } from '@/helpers/createPoll.js';
import { useCompositePost } from '@/hooks/useCompositePost.js';
import { type CompositePost, useComposeStateStore } from '@/store/useComposeStore.js';

interface ValidInDaysSelectorProps {
    post: CompositePost;
    readonly?: boolean;
}

export function ValidInDaysSelector({ post: { poll }, readonly }: ValidInDaysSelectorProps) {
    const validInDays = poll?.validInDays ?? 0;
    const [inputValue, setInputValue] = useState<string>(
        POLL_VALID_IN_DAYS_DEFAULT_LIST.includes(validInDays) ? '' : `${validInDays}`,
    );
    const { updatePoll } = useComposeStateStore();
    const { availableSources } = useCompositePost();

    if (!poll) return null;

    const showCustomDaysInput = shouldShowCustomDaysInput(availableSources);
    const defaultMaxDays = POLL_VALID_IN_DAYS_DEFAULT_LIST[POLL_VALID_IN_DAYS_DEFAULT_LIST.length - 1];

    const onValidInDaysChange = (days: number) => {
        updatePoll({ ...poll, validInDays: days });
    };
    const onCustomValidInDaysChange = (value: string) => {
        const isValidDays = NUMBER_BIGGER_THAN_ZERO.test(value);
        const days = parseInt(value, 10);
        if (!isValidDays || days <= defaultMaxDays) {
            return setInputValue('');
        }
        onValidInDaysChange(days);
    };

    return (
        <Popover as="div" className="relative">
            {({ open, close }) => (
                <>
                    <Popover.Button
                        disabled={readonly}
                        className="flex h-6 items-center gap-2 rounded-full border border-lightMain px-3 text-[13px] font-bold text-lightMain"
                    >
                        <span>{validInDays === 1 ? t`${validInDays} day` : t`${validInDays} days`}</span>
                        {<ChevronUpIcon className={classNames('h-5 w-5 transition-all', open ? ' rotate-180' : '')} />}
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute bottom-full right-0 flex w-[185px] -translate-y-3 flex-col gap-2 rounded-lg bg-lightBottom py-3 text-[15px] shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none">
                            {POLL_VALID_IN_DAYS_DEFAULT_LIST.map((day) => (
                                <div
                                    key={day}
                                    className={classNames(
                                        'h-5 cursor-pointer text-center text-base font-bold leading-5 text-lightMain md:h-7 md:leading-7',
                                        validInDays === day ? 'bg-lightBg' : '',
                                    )}
                                    onClick={() => {
                                        setInputValue('');
                                        onValidInDaysChange(day);
                                        close();
                                    }}
                                >
                                    {day}
                                </div>
                            ))}
                            {showCustomDaysInput ? (
                                <div className="flex items-center gap-2 px-4 text-sm font-bold text-lightMain">
                                    <span>
                                        <Trans>Custom</Trans>
                                    </span>
                                    <form
                                        className="flex-1 rounded-lg bg-lightBg"
                                        onSubmit={(ev) => {
                                            ev.preventDefault();
                                            onCustomValidInDaysChange(inputValue);
                                        }}
                                    >
                                        <input
                                            min={defaultMaxDays + 1}
                                            value={inputValue}
                                            className="h-7 w-full border-0 bg-transparent leading-7 placeholder-secondary focus:border-0 focus:outline-0 focus:ring-0"
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onBlur={(e) => onCustomValidInDaysChange(e.target.value)}
                                        />
                                    </form>
                                </div>
                            ) : null}
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
}
