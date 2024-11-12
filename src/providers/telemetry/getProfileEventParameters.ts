import { safeUnreachable } from '@masknet/kit';

import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import {
    type FarcasterEventParameters,
    type LensEventParameters,
    type TwitterEventParameters,
} from '@/providers/types/Telemetry.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

export function getSelfProfileEventParameters(source: SocialSource) {
    const selfProfile = getCurrentProfileAll()[source];
    if (!selfProfile) throw new Error(`Not profile found, source = ${source}.`);

    switch (source) {
        case Source.Farcaster:
            return {
                farcaster_id: selfProfile.profileId,
                farcaster_handle: selfProfile.handle,
            };
        case Source.Lens:
            return {
                lens_id: selfProfile.profileId,
                lens_handle: selfProfile.handle,
            };
        case Source.Twitter:
            return {
                x_id: selfProfile.profileId,
                x_handle: selfProfile.handle,
            };
        default:
            safeUnreachable(source);
            throw new UnreachableError('source', source);
    }
}

export function getProfileEventParameters(profile: Profile) {
    const fireflyAccountId = useFireflyStateStore.getState().currentProfileSession?.profileId as string | null;
    if (!fireflyAccountId) throw new Error('Firefly account id is missing.');

    const source = profile.source;
    if (!source) throw new Error(`Not source found, source = ${source}.`);

    const selfProfile = getCurrentProfileAll()[source];
    if (!selfProfile) throw new Error(`Not profile found, source = ${source}.`);

    switch (source) {
        case Source.Farcaster:
            return {
                source_firefly_account_id: fireflyAccountId,
                source_farcaster_handle: selfProfile.handle,
                source_farcaster_id: selfProfile.profileId,
                target_farcaster_id: profile.profileId,
                target_farcaster_handle: profile.handle,
            } satisfies FarcasterEventParameters;
        case Source.Lens:
            return {
                source_firefly_account_id: fireflyAccountId,
                source_lens_handle: selfProfile.handle,
                source_lens_id: selfProfile.profileId,
                target_lens_id: profile.profileId,
                target_lens_handle: profile.handle,
            } satisfies LensEventParameters;
        case Source.Twitter:
            return {
                source_firefly_account_id: fireflyAccountId,
                source_x_handle: selfProfile.handle,
                source_x_id: selfProfile.profileId,
                target_x_id: profile.profileId,
                target_x_handle: profile.handle,
            } satisfies TwitterEventParameters;
        default:
            safeUnreachable(source);
            throw new UnreachableError('source', source);
    }
}
