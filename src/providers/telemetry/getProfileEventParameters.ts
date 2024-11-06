import { safeUnreachable } from '@masknet/kit';

import { Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { getCurrentProfileAll } from '@/helpers/getCurrentProfile.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import {
    type FarcasterEventParameters,
    type LensEventParameters,
    type TwitterEventParameters,
} from '@/providers/types/Telemetry.js';
import { useFireflyStateStore } from '@/store/useProfileStore.js';

export function getProfileEventParameters(profile: Profile) {
    const fireflyAccountId = useFireflyStateStore.getState().currentProfileSession?.profileId as string | null;
    if (!fireflyAccountId) throw new Error('Firefly account id is missing.');

    const source = profile.source;
    if (!source) throw new Error(`Not source found, source = ${source}.`);

    const targetProfile = getCurrentProfileAll()[source];
    if (!targetProfile) throw new Error(`Not profile found, source = ${source}.`);

    switch (source) {
        case Source.Farcaster:
            return {
                source_firefly_account_id: fireflyAccountId,
                source_farcaster_handle: targetProfile.handle,
                source_farcaster_id: targetProfile.profileId,
                target_farcaster_id: profile.profileId,
                target_farcaster_handle: profile.handle,
            } satisfies FarcasterEventParameters;
        case Source.Lens:
            return {
                source_firefly_account_id: fireflyAccountId,
                source_lens_handle: targetProfile.handle,
                source_lens_id: targetProfile.profileId,
                target_lens_id: profile.profileId,
                target_lens_handle: profile.handle,
            } satisfies LensEventParameters;
        case Source.Twitter:
            return {
                source_firefly_account_id: fireflyAccountId,
                source_x_handle: targetProfile.handle,
                source_x_id: targetProfile.profileId,
                target_x_id: profile.profileId,
                target_x_handle: profile.handle,
            } satisfies TwitterEventParameters;
        default:
            safeUnreachable(source);
            throw new UnreachableError('source', source);
    }
}
