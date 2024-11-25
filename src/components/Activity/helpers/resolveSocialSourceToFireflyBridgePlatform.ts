import { createLookupTableResolver } from '@masknet/shared-base';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { Platform } from '@/types/bridge.js';

export const resolveSocialSourceToFireflyBridgePlatform = createLookupTableResolver<SocialSource, Platform>(
    {
        [Source.Twitter]: Platform.TWITTER,
        [Source.Farcaster]: Platform.FARCASTER,
        [Source.Lens]: Platform.LENS,
    },
    (source) => {
        throw new UnreachableError('social source', source);
    },
);
