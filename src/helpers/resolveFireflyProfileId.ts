import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { FireflyEndpointProvider } from '@/providers/firefly/Endpoint.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { useFarcasterStateStore, useLensStateStore, useTwitterStateStore } from '@/store/useProfileStore.js';

export function resolveFireflyProfileId(profile: Pick<Profile, 'handle' | 'profileId' | 'source'> | null) {
    if (!profile) return;

    switch (profile.source) {
        case Source.Lens:
            return profile.handle;
        case Source.Twitter:
            return profile.profileId;
        case Source.Farcaster:
            return profile.profileId;
        default:
            safeUnreachable(profile.source);
            throw new UnreachableError('source', profile.source);
    }
}

export function resolveFireflyIdentity(profile: Profile | null): FireflyIdentity | null {
    if (!profile) return null;

    const profileId = resolveFireflyProfileId(profile);
    if (!profileId) return null;

    return {
        id: profileId,
        source: profile.source,
    };
}

export function resolveCurrentFireflyAccountId() {
    const profile =
        useLensStateStore.getState().currentProfile ||
        useFarcasterStateStore.getState().currentProfile ||
        useTwitterStateStore.getState().currentProfile;

    const identity = resolveFireflyIdentity(profile);
    if (!identity) return;

    return resolveFireflyAccountId(identity);
}

export function resolveFireflyAccountId(identity: FireflyIdentity | null) {
    if (!identity) return;

    return FireflyEndpointProvider.getAllPlatformProfileFromFirefly(identity, false)
        .then((x) => x.data?.fireflyAccountId)
        .catch(() => undefined);
}
