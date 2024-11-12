import type { Address } from 'viem';

import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import type { FireflyIdentity } from '@/providers/types/Firefly.js';
import type { Channel, Profile } from '@/providers/types/SocialMedia.js';
import { EventId } from '@/providers/types/Telemetry.js';

export function captureMuteEvent(
    eventId: EventId.MUTE_ALL_SUCCESS | EventId.MUTE_SUCCESS | EventId.UNMUTE_SUCCESS,
    against: FireflyIdentity | Profile | Channel | Address,
) {
    return runInSafeAsync(async () => {
        return TelemetryProvider.captureEvent(eventId, {});
    });
}
