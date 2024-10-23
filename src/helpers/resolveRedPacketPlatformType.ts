import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { PlatformType } from '@/providers/types/RedPacket.js';

export const resolveRedPacketPlatformType = createLookupTableResolver<SocialSource, PlatformType>(
    {
        [Source.Lens]: PlatformType.lens,
        [Source.Farcaster]: PlatformType.farcaster,
        [Source.Twitter]: PlatformType.twitter,
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);
