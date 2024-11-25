import { useInfiniteQuery } from '@tanstack/react-query';
import { addDays, startOfMonth } from 'date-fns';

import { CalendarProvider } from '@/providers/calendar/index.js';

export function useLumaEvents(date: Date) {
    const startTime = startOfMonth(date).getTime();
    const endTime = Math.floor(addDays(date, 45).getTime());

    return useInfiniteQuery({
        queryKey: ['lumaEvents', startTime, endTime],
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
