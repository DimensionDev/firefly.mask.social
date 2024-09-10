import { ClickAwayListener, IconButton, Typography } from '@mui/material';
import { eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns';
import React, { useMemo } from 'react';

import CalendarIcon from '@/assets/calendar.svg';
import { DatePicker } from '@/components/Calendar/DatePicker.js';

interface DatePickerTabProps {
    open: boolean;
    setOpen: (x: boolean) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    list: Record<string, any[]> | null;
    currentTab: 'news' | 'event' | 'nfts';
}

export function DatePickerTab({ selectedDate, setSelectedDate, list, open, setOpen, currentTab }: DatePickerTabProps) {
    const week = useMemo(() => {
        return eachDayOfInterval({ start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) });
    }, [selectedDate]);
    return (
        <div className="relative flex items-center justify-between px-12">
            {week.map((v) => {
                return (
                    <div
                        className={`leading-20 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border border-line text-center text-main ${selectedDate.getDate() === v.getDate() ? 'text-main' : ''} ${
                            list && !list[v.toLocaleDateString()] ? 'cursor-default text-second' : ''
                        }`}
                        key={v.toString()}
                        onClick={() => {
                            if (list && !list[v.toLocaleDateString()]) return;
                            setSelectedDate(v);
                        }}
                    >
                        <Typography>{v.getDate()}</Typography>
                    </div>
                );
            })}
            <ClickAwayListener onClickAway={() => setOpen(false)}>
                <div>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setOpen(!open);
                        }}
                    >
                        <CalendarIcon width={24} height={24} />
                    </IconButton>
                    <DatePicker
                        open={open}
                        setOpen={(open) => setOpen(open)}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        currentTab={currentTab}
                    />
                </div>
            </ClickAwayListener>
        </div>
    );
}
