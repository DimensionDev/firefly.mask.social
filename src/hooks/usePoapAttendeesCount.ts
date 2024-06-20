import { useQuery } from '@tanstack/react-query';

import { SimpleHashWalletProfileProvider } from '@/providers/simplehash/WalletProfile.js';

export function usePoapAttendeesCount(eventId?: number) {
    return useQuery({
        queryKey: ['poap-event-attendees-count', eventId],
        async queryFn({ pageParam }) {
            if (!eventId) return 0;
            const result = await SimpleHashWalletProfileProvider.getPoapEvent(eventId);
            return result.total ?? 0;
        },
    });
}
