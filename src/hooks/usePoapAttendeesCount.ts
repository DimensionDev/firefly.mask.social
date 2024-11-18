import { useQuery } from '@tanstack/react-query';

import { resolveWalletProfileProvider } from '@/helpers/resolveWalletProfileProvider.js';

export function usePoapAttendeesCount(eventId?: number) {
    return useQuery({
        queryKey: ['poap-event-attendees-count', eventId],
        async queryFn({ pageParam }) {
            if (!eventId) return 0;
            const provider = resolveWalletProfileProvider();
            const result = await provider.getPoapEvent(eventId);
            return result.total ?? 0;
        },
    });
}
