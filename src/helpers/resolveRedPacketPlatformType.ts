import { createLookupTableResolver } from '@masknet/shared-base';
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types';

import { SocialPlatform } from '@/constants/enum.js';

export const resolveRedPacketPlatformType = createLookupTableResolver(
    {
        [SocialPlatform.Lens]: FireflyRedPacketAPI.PlatformType.lens,
        [SocialPlatform.Farcaster]: FireflyRedPacketAPI.PlatformType.farcaster,
        [SocialPlatform.Twitter]: FireflyRedPacketAPI.PlatformType.twitter,
    },
    (platform) => {
        throw new Error(`Unknown platform: ${platform}`);
    },
);
