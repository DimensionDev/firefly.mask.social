
import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { useFarcasterStateStore } from '@/store/useFarcasterStore.js';
import { useLensStateStore } from '@/store/useLensStore.js';

export function useCurrentProfile(platform: SocialPlatform) {
    const currentLensProfile = useLensStateStore.use.currentProfile?.();
    const currentFarcasterProfile = useFarcasterStateStore.use.currentProfile?.();

    switch (platform) {
        case SocialPlatform.Lens:
            return currentLensProfile;
        case SocialPlatform.Farcaster:
            return currentFarcasterProfile;
        default:
            safeUnreachable(platform)
            return null
    }
}
