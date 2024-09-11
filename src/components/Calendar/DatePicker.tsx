import { safeUnreachable } from '@masknet/kit';
import { addMonths, endOfMonth, format, isAfter, startOfMonth } from 'date-fns';
import { range } from 'lodash-es';
import { useMemo, useState } from 'react';

import RightArrowIcon from '@/assets/right-arrow.svg';
import { useEventList, useNewsList, useNFTList } from '@/components/Calendar/hooks/useEventList.js';
import { ClickableButton } from '@/components/ClickableButton.js';
import { classNames } from '@/helpers/classNames.js';

interface DatePickerProps {
    open: boolean;
    setOpen: (x: boolean) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    currentTab: 'news' | 'events' | 'nfts';
}

export function DatePicker({ selectedDate, setSelectedDate, open, setOpen, currentTab }: DatePickerProps) {
    const [currentDate, setCurrentDate] = useState(selectedDate);
    const monthStart = startOfMonth(currentDate);
    const startingDayOfWeek = monthStart.getDay();
    const daysInMonth = endOfMonth(currentDate).getDate();
    const daysInPrevMonth = endOfMonth(addMonths(currentDate, -1)).getDate();

    const { data: newsList } = useNewsList(monthStart, currentTab === 'news');
    const { data: eventList } = useEventList(monthStart, currentTab === 'events');
    const { data: nftList } = useNFTList(monthStart, currentTab === 'nfts');

    const getListItems = () => {
        switch (currentTab) {
            case 'news':
                return newsList;
            case 'events':
                return eventList;
            case 'nfts':
                return nftList;
            default:
                safeUnreachable(currentTab);
                return null;
        }
    };

    const isPrevMonthDisabled = useMemo(() => {
        return !isAfter(currentDate, endOfMonth(new Date()));
    }, [currentDate]);
    const isNextMonthDisabled = useMemo(() => {
        return isAfter(addMonths(currentDate, 1), addMonths(endOfMonth(new Date()), 2));
    }, [currentDate]);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setOpen(false);
    };

    const handleMonthClick = (amount: number) => {
        setCurrentDate(addMonths(currentDate, amount));
    };

    const renderDatePicker = () => {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        const table = (
            <table>
                <thead>
                    <tr className="mb-6 text-sm font-bold text-third">
                        {daysOfWeek.map((day) => (
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

                                return (
                                    <td key={dayIndex}>
                                        <ClickableButton
                                            className="border-none bg-none p-[5px] outline-none"
                                            type="submit"
                                            disabled={!getListItems()?.[currentDatePointer.toLocaleDateString()]}
                                            onClick={() => handleDateClick(currentDatePointer)}
                                        >
                                            <span
                                                className={classNames(
                                                    'flex h-[28px] w-[28px] items-center justify-center rounded-full leading-5 text-second',
                                                    {
                                                        '!border-none bg-fireflyBrand text-white':
                                                            selectedDate.toDateString() ===
                                                            currentDatePointer.toDateString(),
                                                        'cursor-pointer border border-second':
                                                            !!getListItems()?.[currentDatePointer.toLocaleDateString()],
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
    };

    if (!open) return null;

    return <div>{renderDatePicker()}</div>;
}
