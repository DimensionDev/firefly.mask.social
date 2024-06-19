import { createLookupTableResolver } from '@masknet/shared-base';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { SessionType } from '@/providers/types/SocialMedia.js';
import {
    useFarcasterStateStore,
    useFireflyStateStore,
    useLensStateStore,
    useTwitterStateStore,
} from '@/store/useProfileStore.js';

export const resolveProfileStoreFromSocialSource = createLookupTableResolver<
    SocialSource,
    typeof useFarcasterStateStore
>(
    {
        [Source.Farcaster]: useFarcasterStateStore,
        [Source.Lens]: useLensStateStore,
        [Source.Twitter]: useTwitterStateStore,
    },
    (x: SocialSource) => {
        throw new UnreachableError('social source', x);
    },
);

export const resolveProfileStoreFromSessionType = createLookupTableResolver<SessionType, typeof useFarcasterStateStore>(
    {
        [SessionType.Farcaster]: useFarcasterStateStore,
        [SessionType.Lens]: useLensStateStore,
        [SessionType.Twitter]: useTwitterStateStore,
        [SessionType.Firefly]: useFireflyStateStore,
    },
    (x: SessionType) => {
        throw new UnreachableError('session type', x);
    },
);
