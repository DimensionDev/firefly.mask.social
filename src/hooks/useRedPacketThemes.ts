import { useQuery } from '@tanstack/react-query';

import { FireflyRedPacket } from '@/providers/red-packet/index.js';

export function useRedPacketThemes() {
    return useQuery({
        queryKey: ['red-packet', 'themes'],
        queryFn: async () => FireflyRedPacket.getThemes(),
    });
}
