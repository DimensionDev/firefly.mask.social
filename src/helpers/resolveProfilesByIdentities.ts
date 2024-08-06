import { memoize } from 'lodash-es';

import { FireflyPlatform, Source } from '@/constants/enum.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { getProfilesByIds } from '@/services/getProfilesByIds.js';

export const resolveProfilesByIdentities: (identities: FireflyIdentity[]) => Promise<Profile[]> = memoize(
    async function (identities: FireflyIdentity[]) {
        if (!identities.length) return [];
        const lensIds = identities.filter((x) => x.source === Source.Lens).map((x) => x.id);
        const farcasterIds = identities.filter((x) => x.source === Source.Farcaster).map((x) => x.id);
        return [
            ...(lensIds.length ? await getProfilesByIds(FireflyPlatform.Lens, lensIds) : []),
            ...(farcasterIds ? await getProfilesByIds(FireflyPlatform.Farcaster, farcasterIds) : []),
        ];
    },
    (identities) => identities.map((x) => `${x.source}.${x.id}`).join(','),
);
