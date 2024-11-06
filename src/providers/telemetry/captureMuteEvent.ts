import { UnreachableError } from '@/constants/error.js';
import { createLookupTableResolver } from '@/helpers/createLookupTableResolver.js';
import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';

const resolveEventId = createLookupTableResolver(
    {
        all: EventId.MUTE_ALL_SUCCESS,
        mute: EventId.MUTE_SUCCESS,
        unmute: EventId.UNMUTE_SUCCESS,
    },
    (action) => {
        throw new UnreachableError('Invalid action', action);
    },
);

export function captureMuteEvent(action: 'all' | 'mute' | 'unmute') {
    return runInSafeAsync(async () => {
        const eventId = resolveEventId(action);
        return TelemetryProvider.captureEvent(eventId, {});
    });
}
