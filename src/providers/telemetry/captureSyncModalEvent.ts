import { runInSafe } from '@/helpers/runInSafe.js';
import { SafaryTelemetryProvider } from '@/providers/telemetry/Safary.js';
import { EventId } from '@/providers/types/Telemetry.js';

export function captureSyncModalEvent(confirmed: boolean) {
    runInSafe(() => {
        SafaryTelemetryProvider.captureEvent(confirmed ? EventId.TOKEN_SYNC_USE_YES : EventId.TOKEN_SYNC_USE_NO, {});
    });
}
