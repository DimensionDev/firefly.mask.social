import { runInSafeAsync } from '@/helpers/runInSafe.js';
import { TelemetryProvider } from '@/providers/telemetry/index.js';
import { EventId } from '@/providers/types/Telemetry.js';

export function captureSyncModalEvent(accountId: string, confirmed: boolean) {
    return runInSafeAsync(() => {
        return TelemetryProvider.captureEvent(confirmed ? EventId.TOKEN_SYNC_USE_YES : EventId.TOKEN_SYNC_USE_NO, {
            firefly_account_id: accountId,
        });
    });
}
