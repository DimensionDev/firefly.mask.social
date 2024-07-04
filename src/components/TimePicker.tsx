import { Popover, Transition } from '@headlessui/react';
import {
    LocalizationProvider,
    MultiSectionDigitalClock,
    type MultiSectionDigitalClockProps,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Fragment, memo, type PropsWithChildren } from 'react';

import { classNames } from '@/helpers/classNames.js';

interface TimePickerProps extends PropsWithChildren<MultiSectionDigitalClockProps<dayjs.Dayjs>> {
    className?: string;
    containerClassName?: string;
}

export const TimePicker = memo<TimePickerProps>(function TimePicker({
    className,
    children,
    containerClassName,
    ...props
}) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Popover as="div" className={classNames('relative', containerClassName)}>
                {({ close }) => (
                    <>
                        <Popover.Button className="w-full">
                            <div className={className}>{children}</div>
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
                                className="absolute bottom-full left-0 z-50 flex translate-y-[110%] flex-col gap-2 rounded-lg bg-lightBottom shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none"
                            >
                                <MultiSectionDigitalClock
                                    {...props}
                                    classes={{ root: 'custom-time-picker' }}
                                    onChange={(...args) => {
                                        close();
                                        props.onChange?.(...args);
                                    }}
                                />
                            </Popover.Panel>
                        </Transition>
                    </>
                )}
            </Popover>
        </LocalizationProvider>
    );
});
