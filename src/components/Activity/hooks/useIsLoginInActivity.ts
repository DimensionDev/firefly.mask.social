import { safeUnreachable } from '@masknet/kit';

import { useActivityConnections } from '@/components/Activity/hooks/useActivityConnections.js';
import { type SocialSource, Source } from '@/constants/enum.js';

export function useIsLoginInActivity(source: SocialSource) {
    const { data } = useActivityConnections();
    if (!data) return false;
    switch (source) {
        case Source.Farcaster:
            return data.rawConnections.farcaster.connected.length > 0;
        case Source.Lens:
            return data.rawConnections.lens.connected.length > 0;
        case Source.Twitter:
            return data.rawConnections.twitter.connected.length > 0;
        default:
            safeUnreachable(source);
            return false;
    }
}
