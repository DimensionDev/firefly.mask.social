import {
    LocalizationProvider,
    MultiSectionDigitalClock,
    type MultiSectionDigitalClockProps,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { memo, type PropsWithChildren, useState } from 'react';

import { Tippy } from '@/esm/Tippy.js';
import { classNames } from '@/helpers/classNames.js';
import { getInteractiveTippyProps } from '@/helpers/tippy.js';

interface TimePickerProps extends PropsWithChildren<MultiSectionDigitalClockProps<dayjs.Dayjs>> {
    className?: string;
    containerClassName?: string;
    panelClassName?: string;
}

export const TimePicker = memo<TimePickerProps>(function TimePicker({
    className,
    containerClassName,
    panelClassName,
    children,
    ...props
}) {
    const [visible, setVisible] = useState(false);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Tippy
                visible={visible}
                onClickOutside={() => setVisible(false)}
                appendTo={() => document.body}
                content={
                    <div
                        className={classNames(
                            'rounded-lg bg-lightBottom shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none',
                            panelClassName,
                        )}
                    >
                        <MultiSectionDigitalClock
                            {...props}
                            autoFocus
                            classes={{ root: 'custom-time-picker' }}
                            onChange={(...args) => {
                                setVisible(false);
                                props.onChange?.(...args);
                            }}
                        />
                    </div>
                }
                className="tippy-card"
                placement="bottom-end"
                {...getInteractiveTippyProps({
                    trigger: 'click',
                })}
            >
                <div className="w-full" onClick={() => setVisible(!visible)}>
                    <span className={className}>{children}</span>
                </div>
            </Tippy>
        </LocalizationProvider>
    );
});
