import { type SocialSource, Source } from '@/constants/enum.js';
import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { getEventParameters } from '@/providers/telemetry/getEventParameters.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import type { Profile } from '@/providers/types/SocialMedia.js';
import { EventId } from '@/providers/types/Telemetry.js';

type ProfileActionType = 'follow' | 'unfollow';

const resolveProfileActionEventIds = createLookupTableResolver<SocialSource, Record<ProfileActionType, EventId>>(
    {
        [Source.Farcaster]: {
            follow: EventId.FARCASTER_PROFILE_FOLLOW_SUCCESS,
            unfollow: EventId.FARCASTER_PROFILE_UNFOLLOW_SUCCESS,
        },
        [Source.Lens]: {
            follow: EventId.LENS_PROFILE_FOLLOW_SUCCESS,
            unfollow: EventId.LENS_PROFILE_UNFOLLOW_SUCCESS,
        },
        [Source.Twitter]: {
            follow: EventId.X_PROFILE_FOLLOW_SUCCESS,
            unfollow: EventId.X_PROFILE_UNFOLLOW_SUCCESS,
        },
    },
    (source) => {
        throw new UnreachableError('source', source);
    },
);

export function captureProfileActionEvent(action: ProfileActionType, profile: Profile) {
    return runInSafeAsync(() => {
        const eventIds = resolveProfileActionEventIds(profile.source);
        const eventId = eventIds[action];

        return TelemetryProvider.captureEvent(eventId, getEventParameters(profile));
    });
}
