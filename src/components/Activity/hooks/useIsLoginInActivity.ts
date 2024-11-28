import { safeUnreachable } from '@masknet/kit';

import { useActivityConnections } from '@/components/Activity/hooks/useActivityConnections.js';
import { type SocialSource, Source, WalletSource } from '@/constants/enum.js';

export function useIsLoginInActivity(source: SocialSource) {
    const { data } = useActivityConnections();
    switch (source) {
        case Source.Farcaster:
            return data?.connected.some((c) => c.source === WalletSource.Farcaster);
        case Source.Lens:
            return data?.connected.some((c) => c.source === WalletSource.Lens);
        case Source.Twitter:
            return data?.connected.some((c) => c.source === WalletSource.Twitter);
        default:
            safeUnreachable(source);
            return false;
    }
}
