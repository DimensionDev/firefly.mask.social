import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { FireflyRedPacketAPI } from '@/providers/red-packet/types.js';

export const resolveRedPacketPlatformType = createLookupTableResolver<SocialSource, FireflyRedPacketAPI.PlatformType>(
    {
        [Source.Lens]: FireflyRedPacketAPI.PlatformType.lens,
        [Source.Farcaster]: FireflyRedPacketAPI.PlatformType.farcaster,
        [Source.Twitter]: FireflyRedPacketAPI.PlatformType.twitter,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);
