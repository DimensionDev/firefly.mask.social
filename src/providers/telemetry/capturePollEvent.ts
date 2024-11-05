import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';

export function capturePollEvent(pollId: string) {
    return runInSafeAsync(() => {
        return TelemetryProvider.captureEvent(EventId.POLL_CREATE_SUCCESS, {
            poll_id: pollId,
        });
    });
}
