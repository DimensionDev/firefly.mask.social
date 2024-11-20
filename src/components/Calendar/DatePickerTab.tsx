import { ClickAwayListener } from '@mui/material';
import { eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns';
import React, { useMemo } from 'react';

import CalendarIcon from '@/assets/calendar.svg';
import { DatePicker } from '@/components/Calendar/DatePicker.js';
import { classNames } from '@/helpers/classNames.js';

interface DatePickerTabProps {
    open: boolean;
    onToggle: (x: boolean) => void;
    date: Date;
    /** locale date string list */
    allowedDates: string[];
    onChange: (date: Date) => void;
}

export function DatePickerTab({ date, allowedDates, onChange, open, onToggle }: DatePickerTabProps) {
    const days = useMemo(() => {
        return eachDayOfInterval({ start: startOfWeek(date), end: endOfWeek(date) });
    }, [date]);

    return (
        <div className="relative flex items-center justify-between border-x border-line p-3">
            {days.map((day) => {
                const localeDateString = day.toLocaleDateString();
                return (
                    <div
                        className={classNames(
                            'leading-20 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border border-secondary text-center text-sm text-secondary',
                            {
                                '!border-none bg-fireflyBrand text-white': date.getDate() === day.getDate(),
                                'cursor-default': allowedDates.includes(localeDateString),
                            },
                        )}
                        key={day.toString()}
                        onClick={() => {
                            if (!allowedDates.includes(localeDateString)) return;
                            onChange(day);
                        }}
                    >
                        <p>{day.getDate()}</p>
                    </div>
                );
            })}
            <ClickAwayListener onClickAway={() => onToggle(false)}>
                <div>
                    <div
                        onClick={() => {
                            onToggle(!open);
                        }}
                    >
                        <CalendarIcon className="cursor-pointer" width={24} height={24} />
                    </div>
                    <DatePicker
                        open={open}
                        onToggle={onToggle}
                        date={date}
                        onChange={onChange}
                        allowedDates={allowedDates}
                    />
                </div>
            </ClickAwayListener>
        </div>
    );
}
