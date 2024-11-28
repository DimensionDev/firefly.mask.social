import { safeUnreachable } from '@masknet/kit';

import { useActivityWalletProfiles } from '@/components/Activity/hooks/useActivityWalletProfiles.js';
import { type SocialSource, Source } from '@/constants/enum.js';

export function useIsLoginInActivity(source: SocialSource) {
    const { data: profiles } = useActivityWalletProfiles();
    if (!profiles) return false;
    const data = profiles;
    switch (source) {
        case Source.Farcaster:
            return data.farcasterProfiles.length > 0;
        case Source.Lens:
            return data.lensProfilesV3.length > 0;
        case Source.Twitter:
            return data.twitterProfiles.length > 0;
        default:
            safeUnreachable(source);
            return false;
    }
}
