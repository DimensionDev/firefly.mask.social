import { makeStyles, MaskColors } from '@masknet/theme';
import { ClickAwayListener, IconButton, Typography } from '@mui/material';
import { eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns';
import React, { useMemo } from 'react';

import CalendarIcon from '@/assets/calendar.svg';
import { DatePicker } from '@/components/Calendar/DatePicker.js';

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        padding: '12px',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
    },
    date: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: MaskColors[theme.palette.mode].maskColor.main,
        fontSize: 16,
        fontFamily: 'Helvetica',
        fontWeight: '400',
        lineHeight: 20,
        borderRadius: 999,
        textAlign: 'center',
        width: '28px !important',
        height: '28px !important',
        border: `0.5px ${MaskColors[theme.palette.mode].maskColor.line} solid`,
        cursor: 'pointer',
    },
    isActive: {
        border: `0.5px ${MaskColors[theme.palette.mode].maskColor.main} solid`,
    },
    disabled: {
        color: MaskColors[theme.palette.mode].maskColor.second,
        cursor: 'default',
    },
}));

interface DatePickerTabProps {
    open: boolean;
    setOpen: (x: boolean) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    list: Record<string, any[]> | null;
    currentTab: 'news' | 'event' | 'nfts';
}

export function DatePickerTab({ selectedDate, setSelectedDate, list, open, setOpen, currentTab }: DatePickerTabProps) {
    const { classes } = useStyles();
    const week = useMemo(() => {
        return eachDayOfInterval({ start: startOfWeek(selectedDate), end: endOfWeek(selectedDate) });
    }, [selectedDate]);
    return (
        <div className={classes.container}>
            {week.map((v) => {
                return (
                    <div
                        className={`${classes.date} ${selectedDate.getDate() === v.getDate() ? classes.isActive : ''} ${
                            list && !list[v.toLocaleDateString()] ? classes.disabled : ''
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
