import { useQuery } from '@tanstack/react-query';
import { addDays, startOfMonth } from 'date-fns';

import { CalendarProvider } from '@/providers/calendar/index.js';
import type { EventProvider } from '@/types/calendar.js';

export function useAvailableDates(type: EventProvider, date: Date, enabled = true) {
    const startTime = startOfMonth(date).getTime();
    const endTime = addDays(startTime, 45).getTime();
    return useQuery({
        enabled,
        queryKey: ['available-dates', type, startTime, endTime],
        queryFn: () => CalendarProvider.getAvailableDates(type, startTime, endTime),
        select(dates) {
            return dates.map((date) => new Date(date).toLocaleDateString());
        },
    });
}
