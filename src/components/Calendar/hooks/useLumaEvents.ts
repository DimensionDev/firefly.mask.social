import { useInfiniteQuery } from '@tanstack/react-query';

import { CalendarProvider } from '@/providers/calendar/index.js';

export function useLumaEvents() {
    return useInfiniteQuery({
        queryKey: ['lumaEvents'],
        initialPageParam: undefined as any,
        queryFn: async ({ pageParam }) => {
            return CalendarProvider.getEventList(pageParam);
        },
        getNextPageParam(page) {
            return page.nextIndicator;
        },
        select(data) {
            return data.pages.flatMap((x) => x.data);
        },
    });
}
