import { safeUnreachable } from '@masknet/kit';
import { useMemo } from 'react';

import { useActivityWalletProfiles } from '@/components/Activity/hooks/useActivityWalletProfiles.js';
import { type SocialSource, Source } from '@/constants/enum.js';
import { useCurrentProfile } from '@/hooks/useCurrentProfile.js';
import { fireflyBridgeProvider } from '@/providers/firefly/Bridge.js';

export function useActivityCurrentAccountHandle(source: SocialSource) {
    const profile = useCurrentProfile(source);
    const { data: profiles } = useActivityWalletProfiles();
    return useMemo(() => {
        if (fireflyBridgeProvider.supported) {
            switch (source) {
                case Source.Twitter:
                    return profiles?.twitterProfiles?.[0]?.handle;
                case Source.Lens:
                    return profiles?.lensProfilesV3?.[0]?.fullHandle;
                case Source.Farcaster:
                    return profiles?.farcasterProfiles?.[0]?.username;
                default:
                    safeUnreachable(source);
                    return;
            }
        }
        return profile?.handle;
    }, [profile, profiles, source]);
}
