import { SafaryTelemetryProvider } from '@/providers/safary/Telemetry.js';
import { EventId } from '@/providers/types/Telemetry.js';

export function captureSyncModalEvent(confirmed: boolean) {
    SafaryTelemetryProvider.captureEvent(confirmed ? EventId.TOKEN_SYNC_USE_YES : EventId.TOKEN_SYNC_USE_NO, {});
}
