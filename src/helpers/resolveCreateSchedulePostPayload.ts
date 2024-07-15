import { createLookupTableResolver } from '@masknet/shared-base';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import {
    createFarcasterSchedulePostPayload,
    type FarcasterSchedulePostPayload,
} from '@/services/createFarcasterSchedulePostPayload.js';
import { createLensSchedulePostPayload, type LensSchedulePayload } from '@/services/createLensSchedulePostPayload.js';
import {
    createTwitterSchedulePostPayload,
    type TwitterSchedulePostPayload,
} from '@/services/createTwitterSchedulePostPayload.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

export type SchedulePayload = LensSchedulePayload | FarcasterSchedulePostPayload | TwitterSchedulePostPayload;

type payloadCreator = (type: ComposeType, compositePost: CompositePost, isThread?: boolean) => Promise<SchedulePayload>;

export const resolveCreateSchedulePostPayload = createLookupTableResolver<SocialSource, payloadCreator>(
    {
        [Source.Lens]: createLensSchedulePostPayload,
        [Source.Farcaster]: createFarcasterSchedulePostPayload,
        [Source.Twitter]: createTwitterSchedulePostPayload,
    },
    (source: SocialSource) => {
        throw new UnreachableError('source', source);
    },
);
