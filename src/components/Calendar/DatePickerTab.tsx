'use client';

import { ClickAwayListener } from '@mui/material';
import { eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns';
import React, { useMemo } from 'react';

import CalendarIcon from '@/assets/calendar.svg';
import { DatePicker } from '@/components/Calendar/DatePicker.js';
import { classNames } from '@/helpers/classNames.js';
import type { NewsEvent } from '@/types/calendar.js';

interface DatePickerTabProps {
    open: boolean;
    setOpen: (x: boolean) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    list: Record<string, NewsEvent[]> | null;
    currentTab: 'news' | 'events' | 'nfts';
}

export function DatePickerTab({ selectedDate, setSelectedDate, list, open, setOpen, currentTab }: DatePickerTabProps) {
    const week = useMemo(() => {
        return eachDayOfInterval({ start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) });
    }, [selectedDate]);

    return (
        <div className="relative flex items-center justify-between border-x border-line p-3">
            {week.map((v) => {
                return (
                    <div
                        className={classNames(
                            'leading-20 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border border-secondary text-center text-sm text-secondary',
                            {
                                '!border-none bg-fireflyBrand text-white': selectedDate.getDate() === v.getDate(),
                                'cursor-default': !!list && !list[v.toLocaleDateString()],
                            },
                        )}
                        key={v.toString()}
                        onClick={() => {
                            if (list && !list[v.toLocaleDateString()]) return;
                            setSelectedDate(v);
                        }}
                    >
                        <p>{v.getDate()}</p>
                    </div>
                );
            })}
            <ClickAwayListener onClickAway={() => setOpen(false)}>
                <div>
                    <div
                        onClick={() => {
                            setOpen(!open);
                        }}
                    >
                        <CalendarIcon className="cursor-pointer" width={24} height={24} />
                    </div>
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
