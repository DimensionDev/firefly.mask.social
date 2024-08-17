import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { type DateCalendarProps } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';
import { memo, type PropsWithChildren, useState } from 'react';

import { InteractiveTippy } from '@/components/InteractiveTippy.js';
import { classNames } from '@/helpers/classNames.js';

interface DatePickerProps extends PropsWithChildren<DateCalendarProps<dayjs.Dayjs>> {
    className?: string;
    containerClassName?: string;
    panelClassName?: string;
}

export const DatePicker = memo<DatePickerProps>(function DatePicker({
    children,
    className,
    containerClassName,
    panelClassName,
    ...props
}) {
    const [visible, setVisible] = useState(false);
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <InteractiveTippy
                content={
                    <div
                        className={classNames(
                            'rounded-lg bg-lightBottom shadow-popover dark:border dark:border-line dark:bg-darkBottom dark:shadow-none',
                            panelClassName,
                        )}
                    >
                        <DateCalendar
                            {...props}
                            classes={{ root: 'custom-date-picker' }}
                            onChange={(...args) => {
                                close();
                                props.onChange?.(...args);
                            }}
                        />
                    </div>
                }
                className="tippy-card"
                placement="bottom-end"
                trigger="click"
            >
                <div className="w-full" onClick={() => setVisible(!visible)}>
                    <span className={className}>{children}</span>
                </div>
            </InteractiveTippy>
        </LocalizationProvider>
    );
});
