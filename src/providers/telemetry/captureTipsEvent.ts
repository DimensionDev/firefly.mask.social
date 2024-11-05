import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId, type Events } from '@/providers/types/Telemetry.js';

export function captureTipsEvent(parameters: Events[EventId.TIPS_SEND_SUCCESS]['parameters']) {
    return runInSafeAsync(() => {
        return TelemetryProvider.captureEvent(EventId.TIPS_SEND_SUCCESS, parameters);
    });
}
