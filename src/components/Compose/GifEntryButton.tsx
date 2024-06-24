import { Popover, Transition } from '@headlessui/react';
import { t } from '@lingui/macro';
import { Fragment, memo } from 'react';

import GifIcon from '@/assets/gif.svg';
import { GifSelector } from '@/components/Compose/GifSelector.js';
import { Tooltip } from '@/components/Tooltip.js';
import { classNames } from '@/helpers/classNames.js';

interface GifEntryButtonProps {
    disabled?: boolean;
}

export const GifEntryButton = memo(function GifEntryButton({ disabled = false }: GifEntryButtonProps) {
    return (
        <Popover as="div" className="relative">
            {({ close }) => (
                <>
                    <Popover.Button className="flex cursor-pointer gap-1 text-main focus:outline-none">
                        <Tooltip content={t`GIF`} placement="top" disabled={disabled}>
                            <GifIcon
                                width={24}
                                height={24}
                                className={classNames(
                                    'text-main',
                                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                                )}
                            />
                        </Tooltip>
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
                        <Popover.Panel
                            static
                            className="absolute bottom-full left-0 z-50 flex w-[280px] -translate-y-3 flex-col gap-2 py-3 rounded-lg shadow-popover bg-lightBottom dark:shadow-none dark:border dark:border-line dark:bg-darkBottom"
                        >
                            <GifSelector onSelected={close} />
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
});
