import { useQuery } from '@tanstack/react-query';

import { FireflySocialMediaProvider } from '@/providers/firefly/SocialMedia.js';

export function useAllConnections(options?: { refetchInterval?: number }) {
    return useQuery({
        queryKey: ['my-wallet-connections'],
        queryFn: () => FireflySocialMediaProvider.getAllConnections(),
        ...options,
    });
}
