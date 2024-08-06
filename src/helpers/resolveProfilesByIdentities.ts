import { memoize } from 'lodash-es';

import { FireflyPlatform, Source } from '@/constants/enum.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { getProfilesByIds } from '@/services/getProfilesByIds.js';

export const resolveProfilesByIdentities: (platforms: FireflyIdentity[]) => Promise<Profile[]> = memoize(
    async function (platforms: FireflyIdentity[]) {
        if (!platforms.length) return [];
        const lensIds = platforms.filter((x) => x.source === Source.Lens).map((x) => x.identity);
        const farcasterIds = platforms.filter((x) => x.source === Source.Farcaster).map((x) => x.identity);
        return [
            ...(lensIds.length ? await getProfilesByIds(FireflyPlatform.Lens, lensIds) : []),
            ...(farcasterIds ? await getProfilesByIds(FireflyPlatform.Farcaster, farcasterIds) : []),
        ];
    },
    (platforms) => platforms.map((x) => `${x.source}.${x.identity}`).join(','),
);
