import { createLookupTableResolver } from '@masknet/shared-base';

import { SocialPlatform } from '@/constants/enum.js';
import { postToFarcaster } from '@/services/postToFarcaster.js';
import { postToLens } from '@/services/postToLens.js';
import { postToTwitter } from '@/services/postToTwitter.js';
import type { CompositePost } from '@/store/useComposeStore.js';
import type { ComposeType } from '@/types/compose.js';

type PostTo = (type: ComposeType, compositePost: CompositePost) => Promise<string>;

export const resolvePostTo = createLookupTableResolver<SocialPlatform, PostTo>(
    {
        [SocialPlatform.Lens]: postToLens,
        [SocialPlatform.Farcaster]: postToFarcaster,
        [SocialPlatform.Twitter]: postToTwitter,
    },
    (source: SocialPlatform) => {
        throw new Error(`Unknown social platform: ${source}`);
    },
);
