import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';

export function resolveFireflyProfileId(profile: Profile | null) {
    if (!profile) return;

    switch (profile.source) {
        case Source.Lens:
            return profile.handle;
        case Source.Twitter:
        case Source.Farcaster:
            return profile.profileId;
        default:
            safeUnreachable(profile.source);
            throw new UnreachableError('source', profile.source);
    }
}

export function resolveFireflyIdentity<T extends Profile>(profile: T | null): FireflyIdentity<T['source']> | null {
    if (!profile) return null;

    const profileId = resolveFireflyProfileId(profile);
    if (!profileId) return null;

    return {
        id: profileId,
        source: profile.source,
    };
}
