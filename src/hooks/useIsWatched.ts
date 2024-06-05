import { useQuery } from '@tanstack/react-query';

import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';
import type { WatchType } from '@/providers/types/SocialMedia.js';

export function useIsWatched(type: WatchType, id: string) {
    return useQuery({
        queryKey: ['is-following', type, id],
        queryFn: async () => {
            return FireflySocialMediaProvider.getIsWatch(type, id);
        },
    });
}
