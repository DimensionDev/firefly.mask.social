import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';

export function captureDraftClickEvent() {
    return runInSafeAsync(async () => {
        return TelemetryProvider.captureEvent(EventId.COMPOSE_DRAFT_BUTTON_CLICK, {});
    });
}
