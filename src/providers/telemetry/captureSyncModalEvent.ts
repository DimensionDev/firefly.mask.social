import { runInSafe } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId, VersionFilter } from '@/providers/types/Telemetry.js';

export function captureSyncModalEvent(confirmed: boolean) {
    runInSafe(() => {
        TelemetryProvider.captureEvent(confirmed ? EventId.TOKEN_SYNC_USE_YES : EventId.TOKEN_SYNC_USE_NO, {});
    });
}
