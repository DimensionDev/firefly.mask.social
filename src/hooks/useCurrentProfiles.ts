import { safeUnreachable } from '@masknet/kit';

import { SocialPlatform } from '@/constants/enum.js';
import { EMPTY_LIST } from '@/constants/index.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function useCurrentProfiles(source: SocialPlatform) {
    const lensProfiles = useLensStateStore.use.profiles();
    const farcasterProfiles = useFarcasterStateStore.use.profiles();
    const twitterProfiles = useTwitterStateStore.use.profiles();

    switch (source) {
        case SocialPlatform.Lens:
            return lensProfiles;
        case SocialPlatform.Farcaster:
            return farcasterProfiles;
        case SocialPlatform.Twitter:
            return twitterProfiles;
        default:
            safeUnreachable(source);
            return EMPTY_LIST;
    }
}
