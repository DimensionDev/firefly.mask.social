import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { FarcasterPollProvider } from '@/providers/farcaster/Poll.js';
import { LensPollProvider } from '@/providers/lens/Poll.js';
import { TwitterPollProvider } from '@/providers/twitter/Poll.js';
import type { Provider } from '@/providers/types/Poll.js';

export const resolvePollProvider = createLookupTableResolver<SocialSource, Provider>(
    {
        [Source.Lens]: LensPollProvider,
        [Source.Farcaster]: FarcasterPollProvider,
        [Source.Twitter]: TwitterPollProvider,
    },
    (source: SocialSource) => {
        throw new UnreachableError('source', source);
    },
);
