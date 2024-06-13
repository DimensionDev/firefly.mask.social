import { createLookupTableResolver } from '@masknet/shared-base';
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';

export const resolveRedPacketPlatformType = createLookupTableResolver<SocialSource, FireflyRedPacketAPI.PlatformType>(
    {
        [Source.Lens]: FireflyRedPacketAPI.PlatformType.lens,
        [Source.Farcaster]: FireflyRedPacketAPI.PlatformType.farcaster,
        [Source.Twitter]: FireflyRedPacketAPI.PlatformType.twitter,
    },
    (platform) => {
        throw new UnreachableError('platform', platform);
    },
);
