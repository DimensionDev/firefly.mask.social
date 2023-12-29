import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useFarcasterStateStore, useLensStateStore } from '@/store/useProfileStore.js';

export function useCurrentProfiles(source: SocialPlatform) {
    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();

    switch (source) {
        case SocialPlatform.Lens:
            return lensProfiles;
        case SocialPlatform.Farcaster:
            return farcasterProfiles;
        default:
            safeUnreachable(source);
            return EMPTY_LIST;
    }
}
