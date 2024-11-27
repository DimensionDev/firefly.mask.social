import { useInfiniteQuery } from '@tanstack/react-query';
import { addDays, startOfDay } from 'date-fns';

import { CalendarProvider } from '@/providers/calendar/index.js';

export function useLumaEvents(date: Date) {
    const startTime = startOfDay(date).getTime();
    const endTime = addDays(startTime, 14).getTime();

    return useInfiniteQuery({
        queryKey: ['luma-events', startTime, endTime],
        initialPageParam: undefined as any,
        queryFn: async ({ pageParam }) => {
            return CalendarProvider.getEventList(startTime, endTime, pageParam);
        },
        getNextPageParam(page) {
            return page.nextIndicator;
        },
        select(data) {
            return data.pages.flatMap((x) => x.data);
        },
    });
}
