import { safeUnreachable } from '@masknet/kit';
import { Box, IconButton, Typography } from '@mui/material';
import { addMonths, endOfMonth, format, isAfter, startOfMonth } from 'date-fns';
import { range } from 'lodash-es';
import { useMemo, useState } from 'react';

import LeftArrowIcon from '@/assets/left-arrow.svg';
import RightArrowIcon from '@/assets/right-arrow.svg';
import { useEventList, useNewsList, useNFTList } from '@/components/Calendar/hooks/useEventList.js';

interface DatePickerProps {
    open: boolean;
    setOpen: (x: boolean) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    currentTab: 'news' | 'event' | 'nfts';
}

export function DatePicker({ selectedDate, setSelectedDate, open, setOpen, currentTab }: DatePickerProps) {
    const [currentDate, setCurrentDate] = useState(selectedDate);
    const monthStart = startOfMonth(currentDate);
    const startingDayOfWeek = monthStart.getDay();
    const daysInMonth = endOfMonth(currentDate).getDate();
    const daysInPrevMonth = endOfMonth(addMonths(currentDate, -1)).getDate();
    const { data: eventList } = useEventList(monthStart, currentTab === 'event');
    const { data: newsList } = useNewsList(monthStart, currentTab === 'news');
    const { data: nftList } = useNFTList(monthStart, currentTab === 'nfts');
    const list = useMemo(() => {
        switch (currentTab) {
            case 'news':
                return newsList;
            case 'event':
                return eventList;
            case 'nfts':
                return nftList;
            default:
                safeUnreachable(currentTab);
                return null;
        }
    }, [currentTab, newsList, eventList, nftList]);

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

    const changeMonth = (amount: number) => {
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
                                <Typography>{day}</Typography>
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
                                        <button
                                            className="border-none bg-none p-0 outline-none"
                                            type="submit"
                                            disabled={!list?.[currentDatePointer.toLocaleDateString()]}
                                            onClick={() => handleDateClick(currentDatePointer)}
                                        >
                                            <Typography
                                                className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-base leading-5 text-third ${
                                                    selectedDate.toDateString() === currentDatePointer.toDateString()
                                                        ? 'bg-bottom text-white'
                                                        : list?.[currentDatePointer.toLocaleDateString()]
                                                          ? 'cursor-pointer text-main'
                                                          : ''
                                                }`}
                                            >
                                                {currentDatePointer.getDate()}
                                            </Typography>
                                        </button>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        );

        return (
            <div className="absolute -left-4 z-50 flex h-[355px] w-[320px] flex-col gap-[6px] rounded-2xl bg-bottom p-[6px] shadow-md">
                <div className="flex items-center justify-between">
                    <Typography className="text-2xl font-bold text-main">{format(currentDate, 'MMMM yyyy')}</Typography>
                    <Box className="flex items-center">
                        <IconButton size="small" onClick={() => changeMonth(-1)} disabled={isPrevMonthDisabled}>
                            <LeftArrowIcon width={24} height={24} />
                        </IconButton>
                        <IconButton size="small" onClick={() => changeMonth(1)} disabled={isNextMonthDisabled}>
                            <RightArrowIcon width={24} height={24} />
                        </IconButton>
                    </Box>
                </div>
                {table}
            </div>
        );
    };

    return <div>{renderDatePicker()}</div>;
}
