import { useQuery } from '@tanstack/react-query';

import { SimpleHashProvider } from '@/providers/simplehash/index.js';

export function usePoapAttendeesCount(eventId?: number) {
    return useQuery({
        queryKey: ['poap-event-attendees-count', eventId],
        async queryFn({ pageParam }) {
            if (!eventId) return 0;
            const result = await SimpleHashProvider.getPoapEvent(eventId);
            return result.total ?? 0;
        },
    });
}
