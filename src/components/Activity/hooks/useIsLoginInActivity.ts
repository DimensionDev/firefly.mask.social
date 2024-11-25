import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { useActivityWalletProfiles } from '@/components/Activity/hooks/useActivityWalletProfiles.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export function useIsLoginInActivity(source: SocialSource) {
    const profile = useCurrentProfile(source);
    const { data: profiles } = useActivityWalletProfiles();
    return useMemo(() => {
        if (!fireflyBridgeProvider.supported) {
            return !!profile;
        }
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
    }, [profile, profiles, source]);
}
