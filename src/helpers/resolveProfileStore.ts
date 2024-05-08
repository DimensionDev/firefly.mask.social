import { createLookupTableResolver } from '@masknet/shared-base';

import { SessionType } from '@/providers/types/SocialMedia.js';
import {
    useFarcasterStateStore,
    useFireflyStateStore,
    useLensStateStore,
    useTwitterStateStore,
} from '@/store/useProfileStore.js';
import { Source, type SocialSource } from '@/constants/enum.js';

export const resolveProfileStore = createLookupTableResolver<SocialSource, typeof useFarcasterStateStore | null>(
    {
        [Source.Farcaster]: useFarcasterStateStore,
        [Source.Lens]: useLensStateStore,
        [Source.Twitter]: useTwitterStateStore,
    },
    () => null,
);


export const resolveProfileStoreFromSessionType = createLookupTableResolver<SessionType, typeof useFarcasterStateStore | null>(
    {
        [SessionType.Farcaster]: useFarcasterStateStore,
        [SessionType.Lens]: useLensStateStore,
        [SessionType.Firefly]: useFireflyStateStore,
        [SessionType.Twitter]: useTwitterStateStore,
    },
    () => null,
);
