import { useInfiniteQuery } from '@tanstack/react-query';
import { addDays, startOfMonth } from 'date-fns';

import { CalendarProvider } from '@/providers/calendar/index.js';

export function useNewsList(date: Date, enabled = true) {
    const startTime = startOfMonth(date).getTime();
    const endTime = addDays(date, 45).getTime();
    return useInfiniteQuery({
        enabled,
        queryKey: ['calendar-news', startTime, endTime],
        queryFn: async ({ pageParam }) => CalendarProvider.getNewsList(startTime, endTime, pageParam),
        initialPageParam: undefined as any,
        getNextPageParam: (page) => page.nextIndicator,
        select(data) {
            return data.pages.flatMap((x) => x.data);
        },
    });
}
