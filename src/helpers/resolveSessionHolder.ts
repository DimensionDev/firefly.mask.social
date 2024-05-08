import { createLookupTableResolver } from '@masknet/shared-base';

import { SessionHolder } from '@/providers/base/SessionHolder.js';
import { farcasterSessionHolder } from '@/providers/farcaster/SessionHolder.js';
import { fireflySessionHolder } from '@/providers/firefly/SessionHolder.js';
import { lensSessionHolder } from '@/providers/lens/SessionHolder.js';
import type { Session } from '@/providers/types/Session.js';
import { SessionType } from '@/providers/types/SocialMedia.js';



export const resolveSessionHolder = createLookupTableResolver<SessionType, SessionHolder<Session> | null>(
    {
        [SessionType.Farcaster]: farcasterSessionHolder,
        [SessionType.Lens]: lensSessionHolder,
        [SessionType.Firefly]: fireflySessionHolder,
        [SessionType.Twitter]: null,
    },
    () => null,
);
