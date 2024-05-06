import { useQuery } from '@tanstack/react-query';

import type { SocialPlatform } from '@/constants/enum.js';
import { resolveSocialMediaProvider } from '@/helpers/resolveSocialMediaProvider.js';

export function useFetchChannel(chanelId: string, source: SocialPlatform) {
    return useQuery({
        queryKey: [source, chanelId],
        queryFn: () => {
            const provider = resolveSocialMediaProvider(source);
            return provider.getChannelById(chanelId);
        },
    });
}
