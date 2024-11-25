import { useQuery } from '@tanstack/react-query';
import { addDays, startOfMonth } from 'date-fns';

import { EMPTY_OBJECT } from '@/constants/index.js';
import { CalendarProvider } from '@/providers/calendar/index.js';
import type { ParsedEvent } from '@/types/calendar.js';

export function useNewsList(date: Date, enabled = true) {
    const startTime = startOfMonth(date).getTime();
    const endTime = addDays(date, 45).getTime();
    return useQuery({
        enabled,
        queryKey: ['calendar-news', startTime, endTime],
        queryFn: async () => CalendarProvider.getNewsList(startTime, endTime),
        select(data) {
            return (
                data?.reduce((acc: Record<string, ParsedEvent[]>, v) => {
                    const date = new Date(Number(v.event_date)).toLocaleDateString();
                    acc[date] = acc[date] || [];
                    acc[date].push(v);
                    return acc;
                }, {}) ?? EMPTY_OBJECT
            );
        },
    });
}
