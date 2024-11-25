import { addMonths, endOfMonth, format, isAfter, startOfMonth } from 'date-fns';
import { range } from 'lodash-es';
import { useMemo, useState } from 'react';

import RightArrowIcon from '@/assets/right-arrow.svg';
import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

interface DatePickerProps {
    open: boolean;
    onToggle: (x: boolean) => void;
    date: Date;
    onChange: (date: Date) => void;
    allowedDates: string[];
}

export function DatePicker({ date, onChange, open, onToggle, allowedDates }: DatePickerProps) {
    const [currentDate, setCurrentDate] = useState(date);
    const monthStart = startOfMonth(currentDate);
    const startingDayOfWeek = monthStart.getDay();
    const daysInMonth = endOfMonth(currentDate).getDate();
    const daysInPrevMonth = endOfMonth(addMonths(currentDate, -1)).getDate();

    const isPrevMonthDisabled = useMemo(() => {
        return !isAfter(currentDate, endOfMonth(new Date()));
    }, [currentDate]);
    const isNextMonthDisabled = useMemo(() => {
        return isAfter(addMonths(currentDate, 1), addMonths(endOfMonth(new Date()), 2));
    }, [currentDate]);

    const handleDateClick = (date: Date) => {
        onChange(date);
        onToggle(false);
    };

    const handleMonthClick = (amount: number) => {
        setCurrentDate(addMonths(currentDate, amount));
    };

    if (!open) return null;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const table = (
        <table>
            <thead>
                <tr className="mb-6 text-sm font-bold text-third">
                    {days.map((day) => (
                        <th key={day}>
                            <p>{day}</p>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {range(6).map((weekIndex) => (
                    <tr key={weekIndex} className="mb-2">
                        {range(7).map((dayIndex) => {
                            const dayOfMonth = weekIndex * 7 + dayIndex - startingDayOfWeek + 1;
                            let currentDatePointer = new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                dayOfMonth,
                            );

                            if (dayOfMonth <= 0) {
                                currentDatePointer = new Date(
                                    currentDate.getFullYear(),
                                    currentDate.getMonth() - 1,
                                    daysInPrevMonth + dayOfMonth,
                                );
                            } else if (dayOfMonth > daysInMonth) {
                                currentDatePointer = new Date(
                                    currentDate.getFullYear(),
                                    currentDate.getMonth() + 1,
                                    dayOfMonth - daysInMonth,
                                );
                            }
                            const localeDateString = currentDatePointer.toLocaleDateString();

                            return (
                                <td key={dayIndex}>
                                    <ClickableButton
                                        className="border-none bg-none p-[5px] outline-none"
                                        type="submit"
                                        disabled={!allowedDates.includes(localeDateString)}
                                        onClick={() => handleDateClick(currentDatePointer)}
                                    >
                                        <span
                                            className={classNames(
                                                'flex h-[28px] w-[28px] items-center justify-center rounded-full text-sm leading-5 text-second',
                                                {
                                                    '!border-none bg-fireflyBrand text-white':
                                                        date.toDateString() === currentDatePointer.toDateString(),
                                                    'cursor-pointer border border-second':
                                                        allowedDates.includes(localeDateString),
                                                },
                                            )}
                                        >
                                            {currentDatePointer.getDate()}
                                        </span>
                                    </ClickableButton>
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="absolute right-[15px] top-12 z-50 flex w-[320px] flex-col gap-[6px] rounded-2xl border border-line bg-bgModal px-[6px] pt-[6px]">
            <div className="flex items-center justify-between">
                <p className="pl-2 font-bold text-main">{format(currentDate, 'MMMM yyyy')}</p>
                <div className="flex items-center">
                    <ClickableButton onClick={() => handleMonthClick(-1)} disabled={isPrevMonthDisabled}>
                        <RightArrowIcon className="rotate-180" width={24} height={24} />
                    </ClickableButton>
                    <ClickableButton onClick={() => handleMonthClick(1)} disabled={isNextMonthDisabled}>
                        <RightArrowIcon width={24} height={24} />
                    </ClickableButton>
                </div>
            </div>
            {table}
        </div>
    );
}
